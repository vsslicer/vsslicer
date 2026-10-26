; hand-written Klipper macros and extended commands
SET_VELOCITY_LIMIT ACCEL=3000 VELOCITY=200 SQUARE_CORNER_VELOCITY=5.0
SET_PRESSURE_ADVANCE ADVANCE=0.045 SMOOTH_TIME=0.04
START_PRINT BED_TEMP=60 EXTRUDER_TEMP={params.EXTRUDER|default(200)|float}
SET_GCODE_VARIABLE MACRO=PRINT_START VARIABLE=bed VALUE="[first_layer_bed_temperature]"
{% set x = params.X|default(10)|float %}
G1 X{x} Y[position_y] F6000 ; move
TIMELAPSE_TAKE_FRAME
M104 S{first_layer_temperature[0] + 5}
M109 S[nozzle_temperature_initial_layer]
EXCLUDE_OBJECT_DEFINE NAME=cube_1 CENTER=110,110 POLYGON=[[100,100],[120,100],[120,120]]
G92 E0
