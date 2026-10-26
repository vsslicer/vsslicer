; HEADER_BLOCK_START
; BambuStudio 02.08.02.61
; model printing time: 10m 11s; total estimated time: 10m 12s
; total layer number: 100
; total filament length [mm] : 1232.38
; total filament volume [cm^3] : 2964.21
; ---- excerpt: first commands (line 580) ----
M73 P0 R10
M201 X20000 Y20000 Z500 E5000
M203 X500 Y500 Z20 E30
M204 P20000 R5000 T20000
M205 X9.00 Y9.00 Z3.00 E2.50
M106 S0
M190 S35 ; set bed temperature and wait for it to be reached
M104 S220 ; set nozzle temperature
; FEATURE: Custom
G28 ; home all axes
G1 Z5 F5000 ; lift nozzle
; MACHINE_START_GCODE_END
; filament start gcode

M142 P1 R35 S40
;VT0 H-1
M109 S220 ; set nozzle temperature and wait for it to be reached
G90
G21
M83 ; use relative distances for extrusion
M981 S1 P20000 ;open spaghetti detector
; CHANGE_LAYER
; Z_HEIGHT: 0.2
; LAYER_HEIGHT: 0.2
G1 E-.8 F1800
M106 S0
G1 X88.212 Y86.755 F30000
M204 S6000
G1 Z.4
G1 Z.2
; ---- excerpt: line 3730 ----
G1 X90.861 Y93.718 E.04156
; WIPE_START
G1 F16200
G1 X90.861 Y92.29 E-.54276
G1 X91.009 Y91.738 E-.21724
; WIPE_END
G1 E-.04 F1800
G17
G3 Z7.4 I1.217 J0 P1  F30000
; CHANGE_LAYER
; Z_HEIGHT: 7.2
; LAYER_HEIGHT: 0.2
; OBJECT_ID: 15
G1 X109.443 Y107.443 F30000
G1 Z7.2
G1 E.8 F1800
; FEATURE: Inner wall
; LINE_WIDTH: 0.39999
G1 F4545
G1 X90.557 Y107.443 E.54952
G1 X90.557 Y88.557 E.54952
