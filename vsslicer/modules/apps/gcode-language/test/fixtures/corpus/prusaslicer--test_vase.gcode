M73 P0 R17
M201 X1000 Y1000 Z200 E8000 ; sets maximum accelerations, mm/sec^2
M203 X200 Y200 Z12 E120 ; sets maximum feedrates, mm / sec
M204 S1250 T1250 ; sets acceleration (S) and retract acceleration (R), mm/sec^2
M205 X8.00 Y8.00 Z0.40 E4.50 ; sets the jerk limits, mm/sec
M862.3 P "MK3MMU2" ; printer model check
M862.1 P0.4 ; nozzle diameter check
M115 U3.14.1 ; tell printer latest fw version
G90 ; use absolute coordinates
M83 ; extruder relative mode
M104 S255 ; set extruder temp
M140 S100 ; set bed temp
M190 S100 ; wait for bed temp
M109 S255 ; wait for extruder temp
G28 W ; home all without mesh bed level
G80 X109.746 Y89.7458 W30.5083 H30.5083 ; mesh bed levelling
M403 E0 F0
G1 Y-3 F1000
T0
G92 E0
M221 S95
M907 E430 ; set extruder motor current
G21 ; set units to millimeters
M900 K0.04 ; Filament gcode LA 1.5
M107
M106 S38.25
M702 C
G4 ; wait
M84 ; disable motors
