extends Node3D

const PLAYER_SCENE := preload("res://scenes/player/wren.tscn")
const ANIMAL_SCENE := preload("res://scenes/npc/animal_npc.tscn")
const HUD_SCENE := preload("res://scenes/ui/hud.tscn")

@onready var sun: DirectionalLight3D = $DirectionalLight3D
@onready var world_env: WorldEnvironment = $WorldEnvironment
@onready var player_spawn: Marker3D = $PlayerSpawn

func _ready() -> void:
	_setup_environment()
	_build_ground()
	_build_pond()
	_scatter_trees()
	_spawn_ambient_particles()

	# hud/player kept untyped (plain "=") so their custom, non-engine
	# members (hud.show_prompt, player.hud, animal.animal_name, ...)
	# don't trip GDScript's static "unknown member" check. See CLAUDE.md.
	var hud = HUD_SCENE.instantiate()
	add_child(hud)

	var player = PLAYER_SCENE.instantiate()
	add_child(player)
	player.global_position = player_spawn.global_position
	player.hud = hud

	_spawn_animals()

func _setup_environment() -> void:
	sun.rotation_degrees = Vector3(-50, -30, 0)
	sun.light_energy = 1.1
	sun.light_color = Color(1.0, 0.95, 0.85)
	sun.shadow_enabled = true

	var env := Environment.new()
	env.background_mode = Environment.BG_SKY

	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.42, 0.62, 0.85)
	sky_mat.sky_horizon_color = Color(0.75, 0.82, 0.78)
	sky_mat.ground_bottom_color = Color(0.3, 0.35, 0.28)
	sky_mat.ground_horizon_color = Color(0.75, 0.82, 0.78)

	var sky := Sky.new()
	sky.sky_material = sky_mat
	env.sky = sky

	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.fog_enabled = true
	env.fog_light_color = Color(0.8, 0.85, 0.8)
	env.fog_density = 0.01
	env.glow_enabled = true
	env.glow_intensity = 0.6
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC

	world_env.environment = env

func _build_ground() -> void:
	var ground := MeshInstance3D.new()
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(60, 60)
	ground.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.42, 0.58, 0.32)
	ground.material_override = mat
	add_child(ground)

	var body := StaticBody3D.new()
	add_child(body)
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(60, 0.1, 60)
	shape.shape = box
	shape.position.y = -0.05
	body.add_child(shape)

func _build_pond() -> void:
	var pond := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = 5.0
	mesh.bottom_radius = 5.0
	mesh.height = 0.1
	pond.mesh = mesh
	pond.position = Vector3(6, 0.02, -4)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.25, 0.45, 0.55, 0.85)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.metallic = 0.2
	mat.roughness = 0.05
	pond.material_override = mat
	add_child(pond)

func _scatter_trees() -> void:
	var positions := [
		Vector3(-8, 0, -6), Vector3(-10, 0, 2), Vector3(-5, 0, 8),
		Vector3(11, 0, 3), Vector3(12, 0, -8), Vector3(2, 0, -10),
		Vector3(-14, 0, -2), Vector3(14, 0, 5),
	]
	for pos in positions:
		var tree := Node3D.new()
		add_child(tree)
		tree.position = pos

		var trunk := MeshInstance3D.new()
		tree.add_child(trunk)
		var trunk_mesh := CylinderMesh.new()
		trunk_mesh.top_radius = 0.2
		trunk_mesh.bottom_radius = 0.3
		trunk_mesh.height = 2.0
		trunk.mesh = trunk_mesh
		trunk.position.y = 1.0
		var trunk_mat := StandardMaterial3D.new()
		trunk_mat.albedo_color = Color(0.4, 0.28, 0.18)
		trunk.material_override = trunk_mat

		var canopy := MeshInstance3D.new()
		tree.add_child(canopy)
		var canopy_mesh := SphereMesh.new()
		canopy_mesh.radius = 1.4
		canopy_mesh.height = 2.6
		canopy.mesh = canopy_mesh
		canopy.position.y = 2.6
		var canopy_mat := StandardMaterial3D.new()
		canopy_mat.albedo_color = Color(0.28, 0.5, 0.25)
		canopy.material_override = canopy_mat

		var body := StaticBody3D.new()
		tree.add_child(body)
		var shape := CollisionShape3D.new()
		var col := CylinderShape3D.new()
		col.radius = 0.35
		col.height = 2.0
		shape.shape = col
		shape.position.y = 1.0
		body.add_child(shape)

func _spawn_ambient_particles() -> void:
	var particles := GPUParticles3D.new()
	add_child(particles)
	particles.position = Vector3(0, 1.5, 0)
	particles.amount = 40
	particles.lifetime = 6.0
	particles.preprocess = 6.0
	particles.emitting = true

	var process_mat := ParticleProcessMaterial.new()
	process_mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	process_mat.emission_box_extents = Vector3(20, 3, 20)
	process_mat.direction = Vector3(0, 1, 0)
	process_mat.spread = 180.0
	process_mat.gravity = Vector3.ZERO
	process_mat.initial_velocity_min = 0.1
	process_mat.initial_velocity_max = 0.3
	process_mat.scale_min = 0.03
	process_mat.scale_max = 0.08
	particles.process_material = process_mat

	var quad := QuadMesh.new()
	quad.size = Vector2(0.08, 0.08)
	var visual_mat := StandardMaterial3D.new()
	visual_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	visual_mat.albedo_color = Color(1.0, 0.9, 0.6, 0.8)
	visual_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	visual_mat.emission_enabled = true
	visual_mat.emission = Color(1.0, 0.9, 0.5)
	visual_mat.emission_energy_multiplier = 3.0
	quad.material = visual_mat
	particles.draw_pass_1 = quad

func _spawn_animals() -> void:
	var configs := [
		{"pos": Vector3(4, 0, 4), "name": "Fox", "problem": "A thorn is stuck in my paw...", "thanks": "Yip! All better, little warden.", "color": Color(0.85, 0.45, 0.2)},
		{"pos": Vector3(-6, 0, 4), "name": "Rabbit", "problem": "I can't find my way back to my burrow...", "thanks": "Thank you for showing me the way!", "color": Color(0.85, 0.8, 0.75)},
		{"pos": Vector3(9, 0, 8), "name": "Deer", "problem": "A fallen branch is blocking my path...", "thanks": "The path is clear now. My thanks.", "color": Color(0.6, 0.45, 0.3)},
	]
	for cfg in configs:
		var animal = ANIMAL_SCENE.instantiate()
		animal.position = cfg["pos"]
		animal.animal_name = cfg["name"]
		animal.problem_text = cfg["problem"]
		animal.thanks_text = cfg["thanks"]
		animal.body_color = cfg["color"]
		add_child(animal)
