M107
G21 ; set units to millimeters
G90 ; use absolute coordinates
M83 ; use relative distances for extrusion
M104 S240 ; set temperature
M109 S240 ; set temperature and wait for it to be reached
M190 S110 ; set bed temperature and wait for it to be reached
G1 Z0.200000 F18000
M204 S1000
G3 X153.908 Y137.164 I-0.010 J5.348 E0.08261
M140 S105 ; set bed temperature
G2 X159.423 Y149.078 I0.954 J0.010 E0.01821
M106 S73.95
; gcode_flavor = klipper
; printer_model = Voron_v2_300_aferburner
