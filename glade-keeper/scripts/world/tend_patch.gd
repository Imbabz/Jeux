extends StaticBody3D

# A withered spot the wizard can Tend (press E) to bring back into bloom.
# Shares the same interact() interface as animals so the player controller
# treats both uniformly.

@export var problem_text: String = "The ground here is withered..."
@export var radius: float = 1.8

var is_tended := false

@onready var patch_mesh: MeshInstance3D = $PatchMesh
@onready var label: Label3D = $Label3D

const FLOWER_COLORS := [
	Color(1, 1, 1), Color(1, 0.85, 0.3), Color(0.85, 0.4, 0.75),
	Color(0.7, 0.55, 0.95), Color(1, 0.45, 0.35),
]

func _ready() -> void:
	add_to_group("tendable")
	# Withered look: desaturated grey-brown circle.
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.34, 0.32, 0.26)
	mat.roughness = 1.0
	patch_mesh.material_override = mat
	patch_mesh.scale = Vector3(radius, 1.0, radius)
	label.text = "Withered"

func interact() -> void:
	if is_tended:
		return
	is_tended = true
	label.text = ""

	# The ground greens again.
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.32, 0.58, 0.24)
	mat.roughness = 1.0
	patch_mesh.material_override = mat

	_grow_flowers()
	_bloom_burst()

func _grow_flowers() -> void:
	var stem_mat := StandardMaterial3D.new()
	stem_mat.albedo_color = Color(0.28, 0.44, 0.20)
	var count := 8
	for i in range(count):
		var ang := TAU * float(i) / float(count)
		var r := radius * (0.3 + 0.5 * fmod(float(i) * 0.37, 1.0))
		var flower := Node3D.new()
		add_child(flower)
		flower.position = Vector3(cos(ang) * r, 0.0, sin(ang) * r)

		var stem := MeshInstance3D.new()
		var stem_mesh := CylinderMesh.new()
		stem_mesh.top_radius = 0.03
		stem_mesh.bottom_radius = 0.03
		stem_mesh.height = 0.5
		stem.mesh = stem_mesh
		stem.position.y = 0.25
		stem.material_override = stem_mat
		flower.add_child(stem)

		var bloom := MeshInstance3D.new()
		var bloom_mesh := SphereMesh.new()
		bloom_mesh.radius = 0.13
		bloom_mesh.height = 0.26
		bloom.mesh = bloom_mesh
		bloom.position.y = 0.55
		var bloom_mat := StandardMaterial3D.new()
		bloom_mat.albedo_color = FLOWER_COLORS[i % FLOWER_COLORS.size()]
		bloom.material_override = bloom_mat
		flower.add_child(bloom)

		# Little pop-in as they grow.
		flower.scale = Vector3.ZERO
		var tween := create_tween()
		tween.tween_interval(0.04 * float(i))
		tween.tween_property(flower, "scale", Vector3.ONE, 0.3) \
			.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func _bloom_burst() -> void:
	var particles := GPUParticles3D.new()
	add_child(particles)
	particles.position = Vector3(0, 0.6, 0)
	particles.amount = 30
	particles.lifetime = 1.4
	particles.one_shot = true
	particles.explosiveness = 0.85
	particles.emitting = true

	var pm := ParticleProcessMaterial.new()
	pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	pm.emission_sphere_radius = radius * 0.6
	pm.direction = Vector3(0, 1, 0)
	pm.spread = 50.0
	pm.gravity = Vector3(0, 0.6, 0)
	pm.initial_velocity_min = 1.0
	pm.initial_velocity_max = 2.2
	pm.scale_min = 0.06
	pm.scale_max = 0.14
	particles.process_material = pm

	var quad := QuadMesh.new()
	quad.size = Vector2(0.12, 0.12)
	var vm := StandardMaterial3D.new()
	vm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	vm.albedo_color = Color(0.7, 1.0, 0.6, 0.95)
	vm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	vm.emission_enabled = true
	vm.emission = Color(0.5, 1.0, 0.5)
	vm.emission_energy_multiplier = 2.5
	quad.material = vm
	particles.draw_pass_1 = quad

	await get_tree().create_timer(2.2).timeout
	if is_instance_valid(particles):
		particles.queue_free()
