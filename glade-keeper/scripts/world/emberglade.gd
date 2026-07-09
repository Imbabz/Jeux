extends Node3D

const PLAYER_SCENE := preload("res://scenes/player/wren.tscn")
const ANIMAL_SCENE := preload("res://scenes/npc/animal_npc.tscn")
const HUD_SCENE := preload("res://scenes/ui/hud.tscn")

# --- Shared scatter data ------------------------------------------------
# These positions are authored as explicit literals (not random) so the
# layout is stable, reproducible, and matches the design-preview render
# exactly. Keep them in sync with the browser preview if you regenerate it.
# For hundreds of props later, switch these loops to MultiMeshInstance3D
# for performance — see docs/GDD.md backlog.
const FLOWERS := [
	Vector2(-6, 3), Vector2(-5, 1), Vector2(-3, 2), Vector2(-2, 5),
	Vector2(0, 3), Vector2(1, 6), Vector2(3, 2), Vector2(-8, 3),
	Vector2(-9, 1.5), Vector2(-4, -2), Vector2(1, -8), Vector2(2, -9),
	Vector2(11, -1), Vector2(10, 6), Vector2(-1, 8), Vector2(5, 7),
]
const FLOWER_COLORS := [
	Color(1, 1, 1), Color(1, 0.85, 0.3), Color(1, 0.5, 0.6),
	Color(0.7, 0.6, 0.95), Color(1, 0.45, 0.35),
]
const MUSHROOMS := [
	Vector2(-11, -3), Vector2(-6, -5), Vector2(11, -6),
	Vector2(12, -4), Vector2(-12, 4), Vector2(13, 8),
]
const ROCKS := [
	Vector2(10, -8), Vector2(-11, -5), Vector2(3, 9),
	Vector2(-3, -6), Vector2(12, 0),
]
const GRASS := [
	Vector2(-2, -3), Vector2(1, 1), Vector2(5, 3), Vector2(-4, 6),
	Vector2(8, 4), Vector2(-9, 6), Vector2(2, -8), Vector2(10, 2),
	Vector2(-5, -4), Vector2(6, 1),
]
const PATH := [
	Vector2(-8, -0.5), Vector2(-6, 1.5), Vector2(-4, 3), Vector2(-2, 4.5),
	Vector2(0, 5.5), Vector2(2, 5.5), Vector2(4, 5),
]
const COTTAGE_POS := Vector3(-8, 0, -2)

@onready var sun: DirectionalLight3D = $DirectionalLight3D
@onready var world_env: WorldEnvironment = $WorldEnvironment
@onready var player_spawn: Marker3D = $PlayerSpawn

func _ready() -> void:
	_setup_environment()
	_build_mountains()
	_build_ground()
	_build_pond()
	_build_path()
	_build_cottage()
	_scatter_trees()
	_scatter_flora()
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
	# Warm key sun: low, warm, long shadows (Journey).
	sun.rotation_degrees = Vector3(-25, -50, 0)
	sun.light_energy = 1.35
	sun.light_color = Color(1.0, 0.88, 0.66)
	sun.shadow_enabled = true

	# Cool back "rim" light for Ni no Kuni-style edge separation.
	var rim := DirectionalLight3D.new()
	rim.rotation_degrees = Vector3(-30, 130, 0)
	rim.light_energy = 0.5
	rim.light_color = Color(0.55, 0.65, 1.0)
	rim.shadow_enabled = false
	add_child(rim)

	var env := Environment.new()
	env.background_mode = Environment.BG_SKY

	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.43, 0.62, 0.88)
	sky_mat.sky_horizon_color = Color(0.85, 0.88, 0.95)
	sky_mat.ground_bottom_color = Color(0.35, 0.32, 0.28)
	sky_mat.ground_horizon_color = Color(0.90, 0.82, 0.70)
	sky_mat.sun_angle_max = 30.0

	var sky := Sky.new()
	sky.sky_material = sky_mat
	env.sky = sky

	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 1.0
	# Lighter distance-only haze so foreground colors stay saturated,
	# while distant mountains fade into atmosphere.
	env.fog_enabled = true
	env.fog_light_color = Color(0.86, 0.90, 0.98)
	env.fog_density = 0.006
	env.glow_enabled = true
	env.glow_intensity = 0.8
	env.glow_bloom = 0.15
	# Linear tonemap keeps the flat, punchy, "graphic" color the
	# Ni no Kuni look wants (filmic desaturates highlights).
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	env.tonemap_exposure = 1.0

	world_env.environment = env

func _build_mountains() -> void:
	# Distant low-poly peaks; the fog fades them into a misty backdrop.
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.46, 0.52, 0.74)
	mat.roughness = 1.0
	var peaks := [
		Vector4(-30, -42, 14, 11), Vector4(-8, -50, 20, 15),
		Vector4(18, -46, 16, 12), Vector4(38, -40, 12, 10),
		Vector4(-46, -30, 11, 9), Vector4(46, -26, 10, 8),
	]
	for p in peaks:
		var peak := MeshInstance3D.new()
		var cone := CylinderMesh.new()
		cone.top_radius = 0.0
		cone.bottom_radius = p.z
		cone.height = p.w
		cone.radial_segments = 7
		peak.mesh = cone
		peak.material_override = mat
		peak.position = Vector3(p.x, p.w * 0.5 - 0.5, p.y)
		add_child(peak)

func _build_ground() -> void:
	var ground := MeshInstance3D.new()
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(60, 60)
	ground.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.34, 0.60, 0.22)
	mat.roughness = 1.0
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
	pond.position = Vector3(6, 0.03, -4)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.28, 0.5, 0.62, 0.9)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.metallic = 0.3
	mat.roughness = 0.05
	pond.material_override = mat
	add_child(pond)

func _build_path() -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.62, 0.52, 0.38)
	mat.roughness = 1.0
	for i in range(PATH.size() - 1):
		var a := PATH[i]
		var b := PATH[i + 1]
		var mid := (a + b) * 0.5
		var seg := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(1.4, 0.06, a.distance_to(b) + 1.4)
		seg.mesh = box
		seg.material_override = mat
		seg.position = Vector3(mid.x, 0.04, mid.y)
		seg.rotation.y = -atan2(b.x - a.x, b.y - a.y)
		add_child(seg)

func _build_cottage() -> void:
	var cottage := Node3D.new()
	add_child(cottage)
	cottage.position = COTTAGE_POS
	cottage.rotation_degrees.y = 25.0

	var wall_mat := StandardMaterial3D.new()
	wall_mat.albedo_color = Color(0.90, 0.82, 0.66)
	var roof_mat := StandardMaterial3D.new()
	roof_mat.albedo_color = Color(0.60, 0.30, 0.24)
	var wood_mat := StandardMaterial3D.new()
	wood_mat.albedo_color = Color(0.35, 0.24, 0.15)

	var walls := MeshInstance3D.new()
	var wall_mesh := BoxMesh.new()
	wall_mesh.size = Vector3(4.0, 2.6, 3.5)
	walls.mesh = wall_mesh
	walls.material_override = wall_mat
	walls.position.y = 1.3
	cottage.add_child(walls)

	var roof := MeshInstance3D.new()
	var roof_mesh := PrismMesh.new()
	roof_mesh.size = Vector3(4.5, 1.6, 3.9)
	roof.mesh = roof_mesh
	roof.material_override = roof_mat
	roof.position.y = 3.4
	cottage.add_child(roof)

	var door := MeshInstance3D.new()
	var door_mesh := BoxMesh.new()
	door_mesh.size = Vector3(0.9, 1.7, 0.15)
	door.mesh = door_mesh
	door.material_override = wood_mat
	door.position = Vector3(0, 0.85, 1.78)
	cottage.add_child(door)

	# Warm lit window — a little glow that reads as "someone's home".
	var window := MeshInstance3D.new()
	var win_mesh := BoxMesh.new()
	win_mesh.size = Vector3(0.9, 0.9, 0.15)
	window.mesh = win_mesh
	var win_mat := StandardMaterial3D.new()
	win_mat.albedo_color = Color(1.0, 0.85, 0.5)
	win_mat.emission_enabled = true
	win_mat.emission = Color(1.0, 0.8, 0.4)
	win_mat.emission_energy_multiplier = 2.5
	window.material_override = win_mat
	window.position = Vector3(1.3, 1.5, 1.78)
	cottage.add_child(window)

	var chimney := MeshInstance3D.new()
	var chim_mesh := BoxMesh.new()
	chim_mesh.size = Vector3(0.5, 1.2, 0.5)
	chimney.mesh = chim_mesh
	chimney.material_override = roof_mat
	chimney.position = Vector3(-1.3, 3.6, 0)
	cottage.add_child(chimney)

	_add_smoke(cottage, Vector3(-1.3, 4.4, 0))

	# Collision matches the wall box only (roof/props are decorative).
	var body := StaticBody3D.new()
	cottage.add_child(body)
	var shape := CollisionShape3D.new()
	var col := BoxShape3D.new()
	col.size = Vector3(4.0, 2.6, 3.5)
	shape.shape = col
	shape.position.y = 1.3
	body.add_child(shape)

func _add_smoke(parent: Node3D, local_pos: Vector3) -> void:
	var smoke := GPUParticles3D.new()
	parent.add_child(smoke)
	smoke.position = local_pos
	smoke.amount = 16
	smoke.lifetime = 4.0
	smoke.preprocess = 4.0
	smoke.emitting = true

	var pm := ParticleProcessMaterial.new()
	pm.direction = Vector3(0.2, 1, 0)
	pm.spread = 10.0
	pm.gravity = Vector3.ZERO
	pm.initial_velocity_min = 0.4
	pm.initial_velocity_max = 0.7
	pm.scale_min = 0.3
	pm.scale_max = 0.8
	pm.scale_over_velocity_min = 0.0
	smoke.process_material = pm

	var quad := QuadMesh.new()
	quad.size = Vector2(0.6, 0.6)
	var vm := StandardMaterial3D.new()
	vm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	vm.albedo_color = Color(0.85, 0.82, 0.8, 0.35)
	vm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	quad.material = vm
	smoke.draw_pass_1 = quad

func _scatter_trees() -> void:
	var positions := [
		Vector3(-8, 0, -6), Vector3(-10, 0, 2), Vector3(-5, 0, 8),
		Vector3(11, 0, 3), Vector3(12, 0, -8), Vector3(2, 0, -10),
		Vector3(-14, 0, -2), Vector3(14, 0, 5),
	]
	# Varied Ghibli-ish greens (plus a couple of warm-tinted ones) so the
	# canopy reads painterly rather than uniform.
	var canopy_colors := [
		Color(0.18, 0.52, 0.20), Color(0.12, 0.44, 0.26),
		Color(0.42, 0.62, 0.16), Color(0.24, 0.56, 0.30),
		Color(0.60, 0.62, 0.18), Color(0.14, 0.48, 0.24),
	]
	var trunk_mat := StandardMaterial3D.new()
	trunk_mat.albedo_color = Color(0.45, 0.30, 0.20)
	var idx := 0
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
		trunk.material_override = trunk_mat

		var canopy_mat := StandardMaterial3D.new()
		canopy_mat.albedo_color = canopy_colors[idx % canopy_colors.size()]
		var canopy := MeshInstance3D.new()
		tree.add_child(canopy)
		var canopy_mesh := SphereMesh.new()
		canopy_mesh.radius = 1.5
		canopy_mesh.height = 2.85
		canopy.mesh = canopy_mesh
		canopy.position.y = 2.7
		canopy.material_override = canopy_mat

		# Second smaller clump for a fuller, hand-drawn silhouette.
		var canopy2_mat := StandardMaterial3D.new()
		canopy2_mat.albedo_color = canopy_colors[(idx + 2) % canopy_colors.size()]
		var canopy2 := MeshInstance3D.new()
		tree.add_child(canopy2)
		var canopy2_mesh := SphereMesh.new()
		canopy2_mesh.radius = 1.05
		canopy2_mesh.height = 2.1
		canopy2.mesh = canopy2_mesh
		canopy2.position = Vector3(0.6, 3.3, -0.3)
		canopy2.material_override = canopy2_mat
		idx += 1

		var body := StaticBody3D.new()
		tree.add_child(body)
		var shape := CollisionShape3D.new()
		var col := CylinderShape3D.new()
		col.radius = 0.35
		col.height = 2.0
		shape.shape = col
		shape.position.y = 1.0
		body.add_child(shape)

func _scatter_flora() -> void:
	var stem_mat := StandardMaterial3D.new()
	stem_mat.albedo_color = Color(0.3, 0.45, 0.22)

	var idx := 0
	for p in FLOWERS:
		var flower := Node3D.new()
		add_child(flower)
		flower.position = Vector3(p.x, 0, p.y)

		var stem := MeshInstance3D.new()
		var stem_mesh := CylinderMesh.new()
		stem_mesh.top_radius = 0.03
		stem_mesh.bottom_radius = 0.03
		stem_mesh.height = 0.4
		stem.mesh = stem_mesh
		stem.position.y = 0.2
		stem.material_override = stem_mat
		flower.add_child(stem)

		var bloom := MeshInstance3D.new()
		var bloom_mesh := SphereMesh.new()
		bloom_mesh.radius = 0.12
		bloom_mesh.height = 0.24
		bloom.mesh = bloom_mesh
		bloom.position.y = 0.45
		var bloom_mat := StandardMaterial3D.new()
		bloom_mat.albedo_color = FLOWER_COLORS[idx % FLOWER_COLORS.size()]
		bloom.material_override = bloom_mat
		flower.add_child(bloom)
		idx += 1

	var cap_mat := StandardMaterial3D.new()
	cap_mat.albedo_color = Color(0.8, 0.3, 0.25)
	var mush_stem_mat := StandardMaterial3D.new()
	mush_stem_mat.albedo_color = Color(0.92, 0.88, 0.78)
	for p in MUSHROOMS:
		var mush := Node3D.new()
		add_child(mush)
		mush.position = Vector3(p.x, 0, p.y)
		var stem := MeshInstance3D.new()
		var sm := CylinderMesh.new()
		sm.top_radius = 0.07
		sm.bottom_radius = 0.09
		sm.height = 0.3
		stem.mesh = sm
		stem.position.y = 0.15
		stem.material_override = mush_stem_mat
		mush.add_child(stem)
		var cap := MeshInstance3D.new()
		var cm := SphereMesh.new()
		cm.radius = 0.18
		cm.height = 0.24
		cap.mesh = cm
		cap.position.y = 0.3
		cap.scale.y = 0.6
		cap.material_override = cap_mat
		mush.add_child(cap)

	var rock_mat := StandardMaterial3D.new()
	rock_mat.albedo_color = Color(0.55, 0.55, 0.58)
	for p in ROCKS:
		var rock := MeshInstance3D.new()
		var rm := SphereMesh.new()
		rm.radius = 0.35
		rm.height = 0.5
		rock.mesh = rm
		rock.scale = Vector3(1.0, 0.6, 0.8)
		rock.position = Vector3(p.x, 0.12, p.y)
		rock.material_override = rock_mat
		add_child(rock)

	var grass_mat := StandardMaterial3D.new()
	grass_mat.albedo_color = Color(0.38, 0.52, 0.26)
	for p in GRASS:
		var tuft := Node3D.new()
		add_child(tuft)
		tuft.position = Vector3(p.x, 0, p.y)
		for j in range(3):
			var blade := MeshInstance3D.new()
			var bm := CylinderMesh.new()
			bm.top_radius = 0.0
			bm.bottom_radius = 0.06
			bm.height = 0.5
			blade.mesh = bm
			blade.material_override = grass_mat
			blade.position = Vector3((j - 1) * 0.1, 0.25, (j - 1) * 0.06)
			blade.rotation.z = (j - 1) * 0.2
			tuft.add_child(blade)

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
