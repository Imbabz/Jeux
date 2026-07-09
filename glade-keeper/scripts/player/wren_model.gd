extends Node3D

# Stylized placeholder wizard "Wren", built from primitives so there's a real
# character (and a cast animation) before a proper .glb model exists. Swap the
# whole node for an imported model later; the controller only calls
# set_move_speed() and play_cast(), so nothing else changes.

const ROBE := Color(0.22, 0.30, 0.46)   # muted indigo
const SKIN := Color(0.86, 0.68, 0.54)
const BEARD := Color(0.90, 0.90, 0.88)
const STAFF := Color(0.42, 0.30, 0.20)
const GLOW := Color(1.0, 0.85, 0.45)

var _anim: Node3D            # inner pivot (bob/sway) so it won't fight facing
var _arm: Node3D             # staff arm pivot (for the cast raise)
var _glow_mat: StandardMaterial3D
var _t := 0.0
var _speed := 0.0
var _cast := 0.0             # 0..1 cast blend, decays back to 0

func _ready() -> void:
	_anim = Node3D.new()
	add_child(_anim)
	_build()

func _mat(color: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = 1.0
	return m

func _add_mesh(parent: Node3D, mesh: Mesh, pos: Vector3, mat: StandardMaterial3D) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = mat
	mi.position = pos
	parent.add_child(mi)
	return mi

func _build() -> void:
	var robe_mat := _mat(ROBE)

	# Robe (tapered cone), torso, shoulders.
	var robe := CylinderMesh.new()
	robe.top_radius = 0.18
	robe.bottom_radius = 0.55
	robe.height = 1.3
	_add_mesh(_anim, robe, Vector3(0, 0.65, 0), robe_mat)

	var torso := SphereMesh.new()
	torso.radius = 0.28
	torso.height = 0.5
	_add_mesh(_anim, torso, Vector3(0, 1.32, 0), robe_mat)

	# Head + beard.
	var head := SphereMesh.new()
	head.radius = 0.20
	head.height = 0.4
	_add_mesh(_anim, head, Vector3(0, 1.62, 0.02), _mat(SKIN))

	var beard := CylinderMesh.new()
	beard.top_radius = 0.16
	beard.bottom_radius = 0.02
	beard.height = 0.5
	_add_mesh(_anim, beard, Vector3(0, 1.42, 0.16), _mat(BEARD))

	# Pointy hat: brim + cone.
	var brim := CylinderMesh.new()
	brim.top_radius = 0.34
	brim.bottom_radius = 0.34
	brim.height = 0.04
	_add_mesh(_anim, brim, Vector3(0, 1.78, 0), robe_mat)
	var hat := CylinderMesh.new()
	hat.top_radius = 0.0
	hat.bottom_radius = 0.26
	hat.height = 0.7
	var hat_mi := _add_mesh(_anim, hat, Vector3(0, 2.12, -0.02), robe_mat)
	hat_mi.rotation.x = -0.12

	# Left arm (static), right arm (holds staff, animates for the cast).
	var arm := CylinderMesh.new()
	arm.top_radius = 0.08
	arm.bottom_radius = 0.08
	arm.height = 0.6
	var arm_l := _add_mesh(_anim, arm, Vector3(-0.32, 1.15, 0.05), robe_mat)
	arm_l.rotation.z = 0.4

	_arm = Node3D.new()
	_arm.position = Vector3(0.34, 1.28, 0.05)
	_anim.add_child(_arm)
	var arm_r := _add_mesh(_arm, arm, Vector3(0, -0.25, 0), robe_mat)
	arm_r.rotation.z = -0.2

	# Staff held in the right hand, glowing tip on top.
	var shaft := CylinderMesh.new()
	shaft.top_radius = 0.04
	shaft.bottom_radius = 0.05
	shaft.height = 2.0
	_add_mesh(_arm, shaft, Vector3(0.12, -0.35, 0.1), _mat(STAFF))

	_glow_mat = StandardMaterial3D.new()
	_glow_mat.albedo_color = GLOW
	_glow_mat.emission_enabled = true
	_glow_mat.emission = GLOW
	_glow_mat.emission_energy_multiplier = 2.0
	var tip := SphereMesh.new()
	tip.radius = 0.13
	tip.height = 0.26
	_add_mesh(_arm, tip, Vector3(0.12, 0.68, 0.1), _glow_mat)

	# A soft light from the staff so it actually casts warm light.
	var glow_light := OmniLight3D.new()
	glow_light.position = Vector3(0.12, 0.68, 0.1)
	glow_light.light_color = GLOW
	glow_light.light_energy = 1.2
	glow_light.omni_range = 3.0
	_arm.add_child(glow_light)

func set_move_speed(speed: float) -> void:
	_speed = speed

func play_cast() -> void:
	# Raise the staff and flare the tip; the blend decays in _process.
	_cast = 1.0
	if _glow_mat:
		_glow_mat.emission_energy_multiplier = 6.0

func _process(delta: float) -> void:
	_t += delta
	if _cast > 0.0:
		_cast = max(0.0, _cast - delta * 1.5)
		if _glow_mat:
			_glow_mat.emission_energy_multiplier = lerp(2.0, 6.0, _cast)

	# Idle breathing + walk bob.
	var moving: float = clamp(_speed / 4.0, 0.0, 1.0)
	var bob_speed := lerp(1.6, 9.0, moving)
	var bob_amp := lerp(0.02, 0.07, moving)
	_anim.position.y = sin(_t * bob_speed) * bob_amp
	_anim.rotation.z = sin(_t * bob_speed * 0.5) * 0.03 * (1.0 + moving)
	# Slight forward lean while walking.
	_anim.rotation.x = lerp(0.0, 0.12, moving)

	# Staff arm: gentle rest, or raised during a cast.
	if _arm:
		var rest := -0.2 + sin(_t * 1.4) * 0.05
		var raised := -1.4
		_arm.rotation.x = lerp(rest, raised, _cast)
