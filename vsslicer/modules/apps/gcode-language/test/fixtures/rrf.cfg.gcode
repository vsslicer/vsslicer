; hand-written RepRapFirmware macro
(parenthesis comment) G28 (inline) X0
M98 P"0:/macros/start.g"
M117 Printing layer 1 ; message text
if heat.heaters[1].current > 50
  echo "hot: " ^ heat.heaters[1].current
  G1 X{move.axes[0].max - 10} F6000
elif state.status == "idle"
  M291 P"idle" R"Info" S1
else
  abort "no heater"
var speed = 100
set var.speed = var.speed + 1
G1 X10.5 Y-3 Z.2 E-0.8 F{var.speed * 60}
N120 G1 X10*57
G28 XY
T1
