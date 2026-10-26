M73 P0 R80
M201 X2500 Y2500 Z400 E5000 ; sets maximum accelerations, mm/sec^2
M203 X180 Y180 Z12 E80 ; sets maximum feedrates, mm / sec
M204 P2000 R1250 T2500 ; sets acceleration (P, T) and retract acceleration (R), mm/sec^2
M205 X8.00 Y8.00 Z2.00 E10.00 ; sets the jerk limits, mm/sec
M486 S0
M862.3 P "MINI" ; printer model check
G90 ; use absolute coordinates
M83 ; extruder relative mode
M104 S170 ; set extruder temp for bed leveling
M140 S100 ; set bed temp
M109 R170 ; wait for bed leveling temp
M190 S100 ; wait for bed temp
G28 ; home all without mesh bed level
G29 ; mesh bed leveling 
G92 E0
G1 Y-2 X179 F2400
M221 S95 ; set flow
G21 ; set units to millimeters
M900 K0.2 ; Filament gcode
M107
G3 X65.416 Y80.578 I2.657 J3.433 E.08029
G2 X91.199 Y90.709 I3.273 J2.268 E.02979
M106 S38.25
G4 ; wait
M84 ; disable motors
; gcode_flavor = marlin2
; printer_model = MINI
