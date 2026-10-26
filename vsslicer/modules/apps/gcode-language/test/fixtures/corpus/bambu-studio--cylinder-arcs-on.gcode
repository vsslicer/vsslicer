; gcode_flavor = marlin
; printer_model = Bambu Lab X1 Carbon
M73 P0 R5
M201 X20000 Y20000 Z500 E5000
M203 X500 Y500 Z20 E30
M204 P20000 R5000 T20000
M205 X9.00 Y9.00 Z3.00 E2.50
M106 S0
M190 S35 ; set bed temperature and wait for it to be reached
M104 S220 ; set nozzle temperature
G28 ; home all axes
G1 Z5 F5000 ; lift nozzle
M142 P1 R35 S40
M109 S220 ; set nozzle temperature and wait for it to be reached
G90
G21
M83 ; use relative distances for extrusion
M981 S1 P20000 ;open spaghetti detector
G3 X109.417 Y97.383 I-6.671 J6.673 E.19768
G2 X104.408 Y89.998 I-6.152 J6.572 E.0662
G17
M1003 S1
M976 S1 P1 ; scan model before printing 2nd layer
M400 P100
M84     ; disable motors
