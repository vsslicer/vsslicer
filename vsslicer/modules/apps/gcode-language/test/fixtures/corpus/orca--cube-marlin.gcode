M73 P0 R16
M201 X10000 Y10000 Z100 E5000
M203 X500 Y500 Z10 E60
M204 P10000 R1000 T10000
M205 X8.00 Y8.00 Z3.00 E5.00 ; sets the jerk limits, mm/sec
M106 S0
G90 ; use absolute coordinates
M83 ; extruder relative mode
M104 S220 ; set extruder temp
M140 S35 ; set bed temp
G28 ; home all
G1 Y1.0 Z0.3 F1000 ; move print head up
M190 S35 ; wait for bed temp
M109 S220 ; wait for extruder temp
G92 E0.0
G21
G4 ; wait
M107 ; turn off fan
M84 ; disable motors
; gcode_flavor = marlin
; printer_model = Generic Marlin Printer
