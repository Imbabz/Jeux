extends StaticBody3D

@export var animal_name: String = "Fox"
@export var problem_text: String = "My paw hurts..."
@export var thanks_text: String = "Thank you, that feels much better!"
@export var body_color: Color = Color(0.85, 0.45, 0.2)

var is_helped := false

@onready var mesh: MeshInstance3D = $MeshInstance3D
@onready var label: Label3D = $Label3D

func _ready() -> void:
	add_to_group("animal")
	var material := StandardMaterial3D.new()
	material.albedo_color = body_color
	mesh.material_override = material
	label.text = animal_name

func interact() -> void:
	if is_helped:
		return
	is_helped = true
	label.text = animal_name + "\n" + thanks_text
	_spawn_sparkles()

func _spawn_sparkles() -> void:
	var particles := GPUParticles3D.new()
	add_child(particles)
	particles.position = Vector3(0, 0.9, 0)
	particles.amount = 24
	particles.lifetime = 1.2
	particles.one_shot = true
	particles.explosiveness = 0.9
	particles.emitting = true

	var process_mat := ParticleProcessMaterial.new()
	process_mat.direction = Vector3(0, 1, 0)
	process_mat.spread = 45.0
	process_mat.gravity = Vector3(0, 0.5, 0)
	process_mat.initial_velocity_min = 1.0
	process_mat.initial_velocity_max = 2.0
	process_mat.scale_min = 0.05
	process_mat.scale_max = 0.12
	particles.process_material = process_mat

	var quad_mesh := QuadMesh.new()
	quad_mesh.size = Vector2(0.1, 0.1)
	var visual_mat := StandardMaterial3D.new()
	visual_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	visual_mat.albedo_color = Color(1.0, 0.95, 0.6, 0.9)
	visual_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	visual_mat.emission_enabled = true
	visual_mat.emission = Color(1.0, 0.9, 0.5)
	visual_mat.emission_energy_multiplier = 2.0
	quad_mesh.material = visual_mat
	particles.draw_pass_1 = quad_mesh

	await get_tree().create_timer(2.0).timeout
	if is_instance_valid(particles):
		particles.queue_free()
