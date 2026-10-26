#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
# PRF-129 oracle: an independent hand merge of Cura's container stacks, written from the Uranium and Cura sources
# (LGPL-3.0, read only, no code copied) and run on the data files of a Cura `resources/` folder. It never imports or
# runs Cura code. Usage, from the module: python3 -I test/tuples/cura_oracle.py <Cura@5bea2f8 resources>
#   test/tuples/fixtures test/tuples/golden/cura.json
#   Uranium@e65ccc1:UM/Settings/DefinitionContainer.py:271-273, :481-491 a definition is its inherits chain, deep merged
#     child last (:513-534 _mergeDicts); :292-303 the merged `overrides` then update the setting nodes they name;
#     :203-205 a value is `value` when not None, else `default_value`.
#   Uranium@e65ccc1:UM/Settings/ContainerStack.py:294-305 the first container with a non-None value wins, then the next.
#   Cura@5bea2f8:cura/Settings/CuraContainerStack.py:412-431 slots top first: user, quality_changes, intent, quality,
#     material, variant, definition_changes, definition.
#   Cura@5bea2f8:cura/Settings/ExtruderStack.py:135-160 a key whose settable_per_extruder is false is read from the
#     global stack; otherwise the extruder stack, then the global one. cura/CuraApplication.py:415 the flag defaults True.
#   Cura@5bea2f8:cura/Settings/GlobalStack.py:227-242, :265-286 `resolve` and `limit_to_extruder` change the lookup; the
#     keys here have neither (checked below).
#   Cura@5bea2f8:plugins/XmlMaterialProfile/XmlMaterialProfile.py:1148-1173, :1202 the keys a material container sets; the
#     tuples leave the material slot empty, so no key here is one of them (checked below).
import configparser, copy, json, os, re, shutil, sys
from urllib.parse import unquote_plus

R, OUT, GOLDEN = sys.argv[1:4]

# (machine, nozzle variant name, material, preferred quality_type)
TUPLES = [
    ('ultimaker_s5', 'AA 0.4', 'generic_pla', 'normal'),
    ('ultimaker_s5', 'AA 0.8', 'generic_pla', 'draft'),
    ('ultimaker_s5', 'BB 0.4', 'generic_pva', 'fast'),
    ('ultimaker_s3', 'AA 0.4', 'generic_pla', 'fast'),
    ('ultimaker3', 'AA 0.4', 'generic_pla', 'normal'),
    ('ultimaker2_plus', '0.4 mm', 'generic_pla', 'normal'),
    ('ultimaker_factor4', 'AA 0.4', 'generic_pla', 'normal'),
    ('creality_ender3', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('creality_ender3', '0.6mm Nozzle', 'generic_pla', 'draft'),
    ('creality_cr10s', '0.4mm Nozzle', 'generic_petg', 'standard'),
    ('artillery_sidewinder_x1', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('voron2_250', 'V6 0.40mm', 'generic_pla', 'normal'),
    ('ratrig_vcore3_200', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('sovol_sv06', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('elegoo_neptune_4', '0.40mm_Elegoo_Nozzle', 'generic_pla', 'Elegoo_layer_020'),
    ('flashforge_adventurer3', '0.4mm Nozzle', 'generic_pla', 'normal'),
    ('kingroon_kp3s', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('mingda_d2', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('two_trees_bluer', '0.6mm Nozzle', 'generic_pla', 'standard'),
    ('vzbot_235', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('flyingbear_ghost_5', '0.4mm Nozzle', 'generic_pla', 'standard'),
    ('tronxy_x5sa', '0.4mm Nozzle', 'generic_pla', 'standard'),
]
GLOBAL_KEYS = ['machine_width', 'machine_depth', 'machine_height', 'machine_heated_bed', 'machine_center_is_zero',
               'machine_gcode_flavor', 'layer_height', 'print_sequence', 'magic_spiralize']
EXTRUDER_KEYS = ['machine_nozzle_size', 'machine_nozzle_id', 'machine_nozzle_offset_x', 'speed_print', 'speed_wall',
                 'speed_travel', 'speed_layer_0', 'retraction_enable', 'extruder_prime_pos_x']
MATERIAL_KEYS = {'default_material_print_temperature', 'default_material_bed_temperature',
                 'material_standby_temperature', 'material_flow_temp_graph', 'cool_fan_speed', 'retraction_amount',
                 'retraction_speed', 'material_adhesion_tendency', 'material_surface_energy',
                 'build_volume_temperature', 'material_diameter'}


def user_of(i):
    """Synthetic user containers (no Cura user file ships): each tuple sets some keys a lower slot also sets."""
    g, e = {}, {}
    if i % 2 == 1: g['layer_height'] = '0.15'
    if i % 3 == 0: g['print_sequence'] = 'one_at_a_time'
    if i % 2 == 0: e['speed_print'] = str(31 + i)
    if i % 4 == 1: e['speed_wall'] = '=speed_print / 2'
    if i % 5 == 2: e['machine_nozzle_size'] = '0.42'
    return {'global': g, 'extruder': e}


def read_json(rel):
    with open(os.path.join(R, rel), encoding='utf-8') as f:
        return json.load(f)


def def_path(id_, kind):
    for k in ([kind, 'definitions'] if kind == 'extruders' else [kind]):
        p = f'{k}/{id_}.def.json'
        if os.path.exists(os.path.join(R, p)): return p
    raise SystemExit(f'no definition {id_}')


def merge_dicts(a, b):  # DefinitionContainer.py:513-534
    out = copy.deepcopy(a)
    for k, v in b.items():
        out[k] = merge_dicts(out[k], v) if k in out and isinstance(v, dict) and isinstance(out[k], dict) else v
    return out


def chain(id_, kind):
    """Files of the inherits chain, the definition first."""
    out = []
    while True:
        p = def_path(id_, kind)
        out.append(p)
        j = read_json(p)
        if 'inherits' not in j: return out
        id_, kind = j['inherits'], 'definitions'


def find(d, key):  # DefinitionContainer.py:_findInDict
    if key in d: return d[key]
    for v in d.values():
        if isinstance(v, dict):
            r = find(v, key)
            if r is not None: return r
    return None


def resolve_def(files):
    merged = {}
    for p in reversed(files): merged = merge_dicts(merged, read_json(p))
    for k, v in merged.get('overrides', {}).items():
        node = find(merged['settings'], k)
        if node is not None: node.update(v)
    return merged


def fmt(v):  # the text profiles-cura keeps for a JSON `value` (read.ts formula()); Cura compiles str(value)
    if isinstance(v, str): return v
    if isinstance(v, bool): return 'True' if v else 'False'
    if isinstance(v, float) and v.is_integer(): return str(int(v))
    if isinstance(v, (int, float)): return repr(v)
    return json.dumps(v, separators=(',', ':'))


def def_value(merged, key):
    node = find(merged['settings'], key)
    if node is None or not ('value' in node or 'default_value' in node): return None
    if node.get('value') is not None: return {'expr': fmt(node['value'])}
    return node.get('default_value')


def line_of(rel, pattern):
    with open(os.path.join(R, rel), encoding='utf-8') as f:
        for n, line in enumerate(f, 1):
            if re.search(pattern, line): return f'{rel}:{n}'
    raise SystemExit(f'{pattern} not in {rel}')


def def_source(files, key, prop):
    """The most derived file whose overrides set `prop` of key, else the most derived whose settings tree does."""
    for where in ('overrides', 'settings'):
        for p in files:
            j = read_json(p)
            node = j.get('overrides', {}).get(key) if where == 'overrides' else find(j.get('settings', {}), key)
            if isinstance(node, dict) and prop in node:
                return line_of(p, rf'"{re.escape(key)}"\s*:')
    raise SystemExit(f'no source for {key}')


def cfg(rel):
    c = configparser.ConfigParser(interpolation=None)
    c.optionxform = str
    c.read(os.path.join(R, rel), encoding='utf-8')
    return c


def cfg_settings(c):  # InstanceContainer [values]; SettingInstance.py:172-173 `=x` is the formula x
    vals = c['values'].items() if 'values' in c else []
    return {k: ({'expr': v[1:]} if v.startswith('=') else v) for k, v in vals}


def walk(top):
    for root, dirs, fs in os.walk(os.path.join(R, top)):
        dirs.sort()
        for f in sorted(fs):
            if f.endswith('.inst.cfg'): yield os.path.relpath(os.path.join(root, f), R)


def stem(rel):
    return unquote_plus(os.path.basename(rel)[:-len('.inst.cfg')])


VARIANTS = {}
for rel in walk('variants'):
    c = cfg(rel)
    if c.get('metadata', 'hardware_type', fallback='nozzle') == 'nozzle':
        VARIANTS.setdefault((c['general']['definition'], c['general']['name']), rel)
QUALITIES = [(rel, cfg(rel)) for rel in walk('quality')]

os.makedirs(OUT, exist_ok=True)
copied = set()


def copy_in(rel):
    if rel in copied: return
    copied.add(rel)
    dst = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(os.path.join(R, rel), dst)


golden = []
for i, (machine, nozzle, material, qtype) in enumerate(TUPLES):
    mfiles = chain(machine, 'definitions')
    mdef = resolve_def(mfiles)
    meta = mdef['metadata']
    extruder = meta['machine_extruder_trains']['0']
    efiles = chain(extruder, 'extruders')
    edef = resolve_def(efiles)
    qdef = meta.get('quality_definition', machine) if meta.get('has_machine_quality') else 'fdmprinter'
    vrel = VARIANTS[(machine, nozzle)]
    cands = [(r, c) for r, c in QUALITIES if c['general']['definition'] == qdef and c['metadata'].get('variant') == nozzle
             and c['metadata'].get('material') == material]
    if not cands: raise SystemExit(f'no quality for {machine} {nozzle} {material}')
    q = next(((r, c) for r, c in cands if c['metadata']['quality_type'] == qtype), cands[0])
    qt = q[1]['metadata']['quality_type']
    gq = next((r, c) for r, c in QUALITIES if c['general']['definition'] == qdef
              and c['metadata'].get('global_quality') == 'True' and c['metadata']['quality_type'] == qt)
    user = user_of(i)
    for rel in mfiles + efiles + [vrel, q[0], gq[0]]: copy_in(rel)

    def slot_value(stack, slot, key):
        if slot == 'user': return cfg_settings({'values': user[stack]}).get(key)
        if slot == 'definition':
            return def_value(edef if stack == 'extruder' else mdef, key)
        if stack == 'global' and slot == 'variant': return None  # no buildplate variant in these tuples
        c = {('extruder', 'quality'): q[1], ('global', 'quality'): gq[1], ('extruder', 'variant'): cfg(vrel)}[(stack, slot)]
        return cfg_settings(c).get(key)

    def source(stack, slot, key):
        if slot == 'user': return 'synthetic user container'
        if slot == 'definition':
            files, d = (efiles, edef) if stack == 'extruder' else (mfiles, mdef)
            node = find(d['settings'], key)
            return def_source(files, key, 'value' if node.get('value') is not None else 'default_value')
        rel = {('extruder', 'quality'): q[0], ('global', 'quality'): gq[0], ('extruder', 'variant'): vrel}[(stack, slot)]
        return line_of(rel, rf'^{re.escape(key)}\s*=')

    values = {}
    for key in GLOBAL_KEYS + EXTRUDER_KEYS:
        node = find(mdef['settings'], key) or find(edef['settings'], key)  # the flag as ExtruderStack.py:135 reads it
        if node is None: raise SystemExit(f'{machine}: no {key}')
        per_extruder = node.get('settable_per_extruder', True)
        if per_extruder != (key in EXTRUDER_KEYS): raise SystemExit(f'{key}: settable_per_extruder {per_extruder}')
        if 'resolve' in node or node.get('limit_to_extruder', '-1') != '-1' or key in MATERIAL_KEYS:
            raise SystemExit(f'{key}: resolve, limit_to_extruder or a material key')
        stacks = ['extruder', 'global'] if per_extruder else ['global']
        found = [(s, slot, v) for s in stacks for slot in ('user', 'quality', 'variant', 'definition')
                 if (v := slot_value(s, slot, key)) is not None]
        s, slot, v = found[0]
        values[key] = {'scope': stacks[0], 'value': v, 'slot': f'{s}.{slot}', 'source': source(s, slot, key),
                       'set_in': [f'{a}.{b}' for a, b, _ in found]}
    golden.append({
        'machine': machine, 'extruder': extruder, 'variant': stem(vrel), 'quality': stem(q[0]),
        'global_quality': stem(gq[0]), 'user': user, 'values': values,
    })

with open(GOLDEN, 'w', encoding='utf-8') as f:
    json.dump({'source': 'Cura@5bea2f8 resources, hand merge by test/tuples/cura_oracle.py', 'tuples': golden}, f, indent=2)
    f.write('\n')
print(len(golden), 'tuples,', len(copied), 'files')
