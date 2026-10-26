// SPDX-License-Identifier: AGPL-3.0-or-later
// Ported from OrcaSlicer@09aa0114b4e145b89cd61015d8cdf29dbc15b008:src/libvgcode/src/ShadersES.hpp
// (Segments_Vertex_Shader_ES), src/libvgcode/src/SegmentTemplate.cpp, src/libvgcode/src/ViewerImpl.cpp:315-337
// and src/libvgcode/include/ColorRange.hpp:17-29, AGPL-3.0-or-later.
// Copyright (c) Prusa Research 2023 Enrico Turri @enricoturri1966, Pavel Mikuš @Godrak
// (ViewerImpl.cpp also: Vojtěch Bubník @bubnikv, Oleksandra Iushchenko @YuSanka). OrcaSlicer contributors made
// the changes upstream marks ORCA that are kept here: top specular 0.6 * 0.25 and role colours 15-19.
// Changes: reads the 28-byte move record through MOVE_TEXTURE_GLSL, colours in the shader from a palette
// texture, range and masks as uniforms; joints, translucency, shadows and clipping dropped (caps always pointy).
import { MOVE_TEXTURE_GLSL } from './move-textures.ts';

/** Corner indices of one segment's prism, 8 corners (`gl_VertexID`), from SegmentTemplate.cpp. */
export const SEGMENT_INDICES = new Uint16Array([
  0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 1, 5, 4, 7, 5, 7, 6,
]);

type Rgb = readonly [number, number, number];

/** libvgcode's default extrusion role colours, indexed by `MoveRole` (0-19); `Unknown` (20) is grey. */
export const ROLE_COLORS: readonly Rgb[] = [
  [230, 179, 179],
  [255, 230, 77],
  [255, 125, 56],
  [31, 31, 255],
  [176, 48, 41],
  [150, 84, 204],
  [240, 64, 64],
  [255, 140, 105],
  [77, 128, 186],
  [255, 255, 255],
  [0, 135, 110],
  [0, 255, 0],
  [0, 128, 0],
  [179, 227, 171],
  [94, 209, 148],
  [102, 92, 199],
  [77, 128, 186],
  [0, 59, 110],
  [0, 64, 0],
  [128, 128, 128],
  [128, 128, 128],
];

/** libvgcode's 11-stop range palette, blue (low) to red (high). */
export const RANGE_COLORS: readonly Rgb[] = [
  [11, 44, 122],
  [19, 89, 133],
  [28, 136, 145],
  [4, 214, 15],
  [170, 242, 0],
  [252, 249, 3],
  [245, 206, 10],
  [227, 136, 32],
  [209, 104, 48],
  [194, 82, 60],
  [148, 38, 22],
];

/** Tool colours, cycled by tool index (ours: libvgcode takes them from the filament settings). */
export const TOOL_COLORS: readonly Rgb[] = [
  [230, 126, 34],
  [52, 152, 219],
  [46, 204, 113],
  [231, 76, 60],
  [155, 89, 182],
  [241, 196, 15],
  [26, 188, 156],
  [236, 240, 241],
];

/** Palette texture rows; one RGBA8 texel per colour. */
export const PALETTE_WIDTH = 32;
export const PALETTE_ROWS = [ROLE_COLORS, TOOL_COLORS, RANGE_COLORS] as const;

export const SEGMENT_VS = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
${MOVE_TEXTURE_GLSL}
uniform highp usampler2D uLayers;
uniform lowp sampler2D uPalette;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 uCamera;
uniform int uFirstLocal;
uniform int uChunkFirst;
uniform int uRecordCount;
uniform uint uNextStart;
uniform int uLayerCount;
uniform uint uRoleMask;
uniform uint uHiddenFlags;
uniform uint uMode;
uniform vec2 uRange;
out vec3 vColor;

const vec3 light_top_dir = vec3(-0.4574957, 0.4574957, 0.7624929);
const float light_top_diffuse = 0.6 * 0.8;
const float light_top_specular = 0.6 * 0.25;
const float light_top_shininess = 20.0;
const vec3 light_front_dir = vec3(0.6985074, 0.1397015, 0.6985074);
const float light_front_diffuse = 0.6 * 0.3;
const float ambient = 0.3;
const float emission = 0.15;
const vec3 UP = vec3(0, 0, 1);
const float TRAVEL_SIZE = 0.1;
const vec3 DUMMY_COLOR = vec3(64.0 / 255.0);
const vec2 SIGNS[16] = vec2[](
  vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, 0.0), vec2(0.0, -1.0),
  vec2(0.0, -1.0), vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, 0.0),
  vec2(0.0, 1.0), vec2(-1.0, 0.0), vec2(0.0, 0.0), vec2(1.0, 0.0),
  vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(-1.0, 0.0), vec2(0.0, 0.0));

float direct_lighting(vec3 eye_position, vec3 eye_normal) {
  float top_diffuse = light_top_diffuse * max(dot(eye_normal, light_top_dir), 0.0);
  float front_diffuse = light_front_diffuse * max(dot(eye_normal, light_front_dir), 0.0);
  float top_specular = light_top_specular * pow(max(dot(-normalize(eye_position), reflect(-light_top_dir, eye_normal)), 0.0), light_top_shininess);
  return top_diffuse + front_diffuse + top_specular;
}

vec3 palette(int row, int i) { return texelFetch(uPalette, ivec2(i, row), 0).rgb; }

// NaN or infinite start times (no planner yet) come through as bits: isnan may be folded away.
bool finite(uint bits) { return (bits & 0x7f800000u) != 0x7f800000u; }

float speed(int b, float len) {
  uint t0 = moveWord(b, 6);
  uint t1 = b + 1 < uRecordCount ? moveWord(b + 1, 6) : uNextStart;
  float d = uintBitsToFloat(t1) - uintBitsToFloat(t0);
  return finite(t0) && finite(t1) && d > 0.0 ? len / d : -1.0;
}

float layerTime(int g) {
  if (uLayerCount == 0) return -1.0;
  int w = textureSize(uLayers, 0).x;
  int lo = 0;
  int hi = uLayerCount - 1;
  while (lo < hi) {
    int mid = (lo + hi + 1) / 2;
    if (int(texelFetch(uLayers, ivec2(mid % w, mid / w), 0).r) <= g) lo = mid; else hi = mid - 1;
  }
  uint t = texelFetch(uLayers, ivec2(lo % w, lo / w), 0).g;
  return finite(t) ? uintBitsToFloat(t) : -1.0;
}

vec3 gradient(float v) {
  if (v < 0.0) return DUMMY_COLOR;
  float span = uRange.y - uRange.x;
  float t = span > 0.0 ? clamp((v - uRange.x) / span, 0.0, 1.0) * 10.0 : 0.0;
  int i = min(int(t), 9);
  return mix(palette(2, i), palette(2, i + 1), t - float(i));
}

void main() {
  int b = uFirstLocal + gl_InstanceID;
  int a = b - 1;
  uvec3 rtf = moveRoleToolFlags(b);
  if (rtf.x > 31u || ((uRoleMask >> rtf.x) & 1u) == 0u || (rtf.z & uHiddenFlags) != 0u) {
    vColor = vec3(0.0);
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }
  vec3 pos_a = movePosition(a);
  vec3 pos_b = movePosition(b);
  vec3 line = pos_b - pos_a;
  float line_len = length(line);
  vec3 line_dir = line_len < 1e-4 ? vec3(1.0, 0.0, 0.0) : line / line_len;
  vec3 line_right_dir = abs(dot(line_dir, UP)) > 0.9
    ? normalize(cross(vec3(1, 0, 0), line_dir))
    : normalize(cross(line_dir, UP));
  vec3 line_up_dir = normalize(cross(line_right_dir, line_dir));
  vec2 wh = moveWidthHeight(b);
  if (!(wh.x > 0.0 && wh.y > 0.0)) wh = vec2(TRAVEL_SIZE);
  int vertex_id = gl_VertexID;
  vec3 endpoint_pos = vertex_id < 4 ? pos_a : pos_b;
  vec3 closer_pos = dot(uCamera - pos_a, uCamera - pos_a) < dot(uCamera - pos_b, uCamera - pos_b) ? pos_a : pos_b;
  vec3 camera_view_dir = normalize(closer_pos - uCamera);
  vec3 diagonal_dir_border = normalize(wh.y * line_up_dir + wh.x * line_right_dir);
  bool is_vertical_view = abs(dot(camera_view_dir, line_up_dir)) / abs(dot(diagonal_dir_border, line_up_dir)) >
    abs(dot(camera_view_dir, line_right_dir)) / abs(dot(diagonal_dir_border, line_right_dir));
  vec2 signs = SIGNS[vertex_id + 8 * int(is_vertical_view)];
  // Upstream uses sign(), which is 0 directly in front of the camera and collapses the prism.
  float view_right_sign = dot(-camera_view_dir, line_right_dir) < 0.0 ? -1.0 : 1.0;
  float view_top_sign = dot(-camera_view_dir, line_up_dir) < 0.0 ? -1.0 : 1.0;
  float half_height = 0.5 * wh.y;
  float half_width = 0.5 * wh.x;
  vec3 horizontal_dir = half_width * line_right_dir;
  vec3 pos = endpoint_pos + signs.x * view_right_sign * horizontal_dir + signs.y * view_top_sign * half_height * line_up_dir;
  if (vertex_id == 2 || vertex_id == 7) pos += (vertex_id == 2 ? -1.0 : 1.0) * line_dir * half_width;
  vec3 eye_position = (uView * vec4(pos, 1.0)).xyz;
  vec3 eye_normal = (uView * vec4(normalize(pos - endpoint_pos), 0.0)).xyz;

  vec3 base;
  if (uMode == 0u) base = palette(0, int(min(rtf.x, 20u)));
  else if (uMode == 2u) base = palette(1, int(rtf.y % ${TOOL_COLORS.length}u));
  else base = gradient(uMode == 1u ? speed(b, line_len) : layerTime(uChunkFirst + b));
  vColor = base * (ambient + emission + direct_lighting(eye_position, eye_normal));
  gl_Position = uProjection * vec4(eye_position, 1.0);
}`;

export const SEGMENT_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 color;
void main() { color = vec4(clamp(vColor, 0.0, 1.0), 1.0); }`;
