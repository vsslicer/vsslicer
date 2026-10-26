; Postprocessed by [ArcWelder](https://github.com/FormerLurker/ArcWelderLib)
; Copyright(C) 2020 - Brad Hochgesang
; resolution=0.05mm
; path_tolerance=5%
; max_radius=1000000.00mm
; default_xyz_precision=3
; ---- excerpt: first commands (line 623) ----
M107
G21 ; set units to millimeters
G90 ; use absolute coordinates
M83 ; use relative distances for extrusion
M104 S240 ; set temperature
M109 S240 ; set temperature and wait for it to be reached
M190 S110 ; set bed temperature and wait for it to be reached
M107
;LAYER_CHANGE
;Z:0.2
;HEIGHT:0.2
;BEFORE_LAYER_CHANGE
;0.2

G1 Z0.200000 F18000
;AFTER_LAYER_CHANGE
;0.2

TIMELAPSE_TAKE_FRAME
G1 E-0.75000 F3000
G1 Z1.000000 F18000
G1 X133.479 Y138.198
G1 Z0.200000
G1 E0.75000 F1800
;TYPE:Skirt
;WIDTH:0.56
G1 F1500
M204 S1000
G1 X134.372 Y137.528 E0.04509
G1 X135.384 Y137.059 E0.04509
; ---- excerpt: line 2854 ----
G1 F1124
G1 X137.215 Y157.790 E0.13499
G1 X137.215 Y153.210 E0.13499
G1 X141.795 Y153.210 E0.13499
G1 X141.795 Y157.730 E0.13322
G1 X141.449 Y157.590 F18000
G1 X138.317 Y156.568
;TYPE:Internal infill
;WIDTH:0.44
G1 F1124
G1 X139.620 Y154.312 E0.08086
G1 X139.391 Y154.312 E0.00710
G1 X140.694 Y156.568 E0.08086
G1 X140.694 Y156.688 E0.00373
G1 X138.317 Y156.688 E0.07375
G1 X138.317 Y156.568 E0.00373
G1 X138.317 Y155.995 E0.01779
G1 X140.694 Y155.995 E0.07375
; INIT stop printing object cube_1 id:0 copy 1
; INIT printing object union_3 id:2 copy 0
G1 E-0.75000 F3000
