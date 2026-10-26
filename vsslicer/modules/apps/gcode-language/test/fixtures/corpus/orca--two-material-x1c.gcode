; gcode_flavor = marlin
; printer_model = Bambu Lab X1 Carbon
M73 P0 R77
M201 X20000 Y20000 Z500 E5000
M203 X500 Y500 Z20 E30
M204 P20000 R5000 T20000
M205 X9.00 Y9.00 Z3.00 E2.50 ; sets the jerk limits, mm/sec
M106 S0
M190 S35 ; set bed temperature and wait for it to be reached
G0 Z20 F9000
G92 E0; G1 E-10 F1200
G28
M970 Q1 A10 B10 C130 K0
M974 Q1 S1 P0
M220 S100 ;Reset Feedrate
M221 S100 ;Reset Flowrate
G29 ;Home
G90;
G1 Z2.0 F3000 ;Move Z Axis up 
M109 S205;
M142 P1 R35 S40
G21
M83 ; use relative distances for extrusion
M981 S1 P20000 ;open spaghetti detector
M991 S0 P0 ;notify layer change
M624 AQAAAAAAAAA=
M622.1 S1 ; for prev firmware, default turned on
M1002 judge_flag timelapse_record_flag
M622 J1
M971 S11 C10 O0
M623
M625
G3  X181.539 Y233.249   I-4.367 J-2.786 E0.1237 F3000
G2  X170.702 Y233.084   I-3.389 J6.021 E0.3378
G17
M620 S1A
M400
M104 S220
M620.1 E F523 T240
T1
M621 S1A
G4 S0
M976 S1 P1 ; scan model before printing 2nd layer
T0
M140 S0 ; turn off bed
T255
M17 S
M201.2 K1.0 ; Reset acc magnitude
M73.2   R1.0 ;Reset left time magnitude
