extends Node3D

const PLAYER_SCENE := preload("res://scenes/player/wren.tscn")
const ANIMAL_SCENE := preload("res://scenes/npc/animal_npc.tscn")
const HUD_SCENE := preload("res://scenes/ui/hud.tscn")
const TEND_PATCH_SCENE := preload("res://scenes/world/tend_patch.tscn")
const TOON_SHADER := preload("res://shaders/toon.gdshader")

# Withered spots the wizard can Tend & grow back to life.
const WITHERED := [Vector2(3, 1), Vector2(-4, -1), Vector2(0, -2)]

# --- Day -> dusk cycle ---
@export var day_cycle_speed := 0.05  # slow ping-pong morning <-> dusk
var _phase := 0.6                    # start mid-morning
var _env: Environment
var _sky_mat: ProceduralSkyMaterial
var _dusk_lights: Array = []

# --- Shared scatter data (explicit literals so layout is stable and the
# browser design-preview can reproduce it exactly). Trees are placed by a
# deterministic formula (see _build_forest) rather than listed. When the real
# Quaternius/Kenney meshes arrive, swap the primitive builders below for
# instances of the imported .glb scenes — the positions/logic stay the same.
const FLOWERS := [
	Vector2(-6, 3), Vector2(-5, 1), Vector2(-3, 2), Vector2(-2, 5),
	Vector2(0, 3), Vector2(1, 6), Vector2(3, 2), Vector2(-8, 3),
	Vector2(-9, 1.5), Vector2(-4, -2), Vector2(1, -8), Vector2(2, -9),
	Vector2(-1, 8), Vector2(5, 7), Vector2(7, 3), Vector2(-7, 7),
	Vector2(3, 9), Vector2(-2, -6),
]
const FLOWER_COLORS := [
	Color(1, 1, 1), Color(1, 0.85, 0.3), Color(0.85, 0.4, 0.75),
	Color(0.7, 0.55, 0.95), Color(1, 0.45, 0.35),
]
const MUSHROOMS := [
	Vector2(-6, -5), Vector2(-7, -4), Vector2(11, -6), Vector2(-12, 4),
	Vector2(8, 9), Vector2(-4, 8), Vector2(6, -7), Vector2(-10, 5),
]
const ROCKS := [
	Vector2(10, -8), Vector2(-11, -5), Vector2(3, 9),
	Vector2(-3, -6), Vector2(12, 0), Vector2(-8, 8),
]
const FERNS := [
	Vector2(-9, -3), Vector2(-6, 6), Vector2(7, 6), Vector2(-2, -4),
	Vector2(9, 2), Vector2(-11, 1), Vector2(4, -6), Vector2(-4, 7),
	Vector2(10, -3), Vector2(-7, -6),
]
# Winding stream, widening into the pond at its end.
const STREAM := [
	Vector2(-15, -9), Vector2(-11, -7), Vector2(-6, -6),
	Vector2(-1, -5), Vector2(3, -4.5),
]
const COTTAGE_POS := Vector3(-9, 0, 2)

@onready var sun: DirectionalLight3D = $DirectionalLight3D
@onready var world_env: WorldEnvironment = $WorldEnvironment
@onready var player_spawn: Marker3D = $PlayerSpawn

func _ready() -> void:
	_setup_environment()
	_build_mountains()
	_build_ground()
	_build_stream()
	_build_pond()
	_build_cottage()
	_build_treehouse()
	_build_forest()
	_build_undergrowth()
	_scatter_flora()
	_build_tend_patches()
	_spawn_ambient_particles()
	_spawn_fairy_motes()

	# hud/player kept untyped (plain "=") so their custom members don't trip
	# GDScript's static "unknown member" check. See CLAUDE.md.
	var hud = HUD_SCENE.instantiate()
	add_child(hud)

	var player = PLAYER_SCENE.instantiate()
	add_child(player)
	player.global_position = player_spawn.global_position
	player.hud = hud

	_spawn_animals()
	# Cel-shade every solid material now that the whole world exists.
	_apply_toon_shading()

func _setup_environment() -> void:
	# Warm, low, dappled forest light (Radagast/Ni no Kuni mood).
	sun.rotation_degrees = Vector3(-28, -55, 0)
	sun.light_energy = 1.5
	sun.light_color = Color(1.0, 0.85, 0.58)
	sun.shadow_enabled = true

	# Cool back rim for edge separation against the dark canopy.
	var rim := DirectionalLight3D.new()
	rim.rotation_degrees = Vector3(-30, 130, 0)
	rim.light_energy = 0.5
	rim.light_color = Color(0.5, 0.62, 1.0)
	rim.shadow_enabled = false
	add_child(rim)

	var env := Environment.new()
	env.background_mode = Environment.BG_SKY

	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.30, 0.50, 0.70)
	sky_mat.sky_horizon_color = Color(0.92, 0.80, 0.62)
	sky_mat.ground_bottom_color = Color(0.20, 0.24, 0.18)
	sky_mat.ground_horizon_color = Color(0.85, 0.78, 0.66)
	sky_mat.sun_angle_max = 30.0

	var sky := Sky.new()
	sky.sky_material = sky_mat
	env.sky = sky

	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.9
	# Heavier atmospheric haze reads as god-ray depth between the trees.
	env.fog_enabled = true
	env.fog_light_color = Color(0.95, 0.85, 0.62)
	env.fog_light_energy = 1.2
	env.fog_sun_scatter = 0.4
	env.fog_density = 0.02
	env.glow_enabled = true
	env.glow_intensity = 0.9
	env.glow_bloom = 0.2
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	env.tonemap_exposure = 1.0

	# Volumetric shafts of light through the canopy (the "god-ray" look).
	env.volumetric_fog_enabled = true
	env.volumetric_fog_density = 0.02
	env.volumetric_fog_albedo = Color(0.95, 0.88, 0.7)
	env.volumetric_fog_emission = Color(0.05, 0.05, 0.03)

	world_env.environment = env
	_env = env
	_sky_mat = sky_mat

func _build_mountains() -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.40, 0.48, 0.68)
	mat.roughness = 1.0
	var peaks := [
		Vector4(-30, -42, 14, 12), Vector4(-8, -50, 20, 16),
		Vector4(24, -46, 16, 13), Vector4(44, -38, 12, 10),
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
	mesh.size = Vector2(70, 70)
	ground.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.24, 0.42, 0.16)
	mat.roughness = 1.0
	ground.material_override = mat
	add_child(ground)

	var body := StaticBody3D.new()
	add_child(body)
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(70, 0.1, 70)
	shape.shape = box
	shape.position.y = -0.05
	body.add_child(shape)

func _build_stream() -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.32, 0.56, 0.66, 0.9)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.metallic = 0.3
	mat.roughness = 0.06
	for i in range(STREAM.size() - 1):
		var a := STREAM[i]
		var b := STREAM[i + 1]
		var mid := (a + b) * 0.5
		var seg := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(1.6, 0.06, a.distance_to(b) + 1.0)
		seg.mesh = box
		seg.material_override = mat
		seg.position = Vector3(mid.x, 0.04, mid.y)
		seg.rotation.y = -atan2(b.x - a.x, b.y - a.y)
		add_child(seg)

func _build_pond() -> void:
	var pond := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = 4.5
	mesh.bottom_radius = 4.5
	mesh.height = 0.1
	pond.mesh = mesh
	pond.position = Vector3(6, 0.03, -4)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.30, 0.55, 0.66, 0.9)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.metallic = 0.3
	mat.roughness = 0.05
	pond.material_override = mat
	add_child(pond)

func _tree_canopy_color(idx: int) -> Color:
	# Deep, saturated forest greens (some warm-tinted) for painterly variety.
	var colors := [
		Color(0.10, 0.34, 0.16), Color(0.14, 0.40, 0.20),
		Color(0.20, 0.46, 0.16), Color(0.09, 0.30, 0.20),
		Color(0.24, 0.44, 0.13), Color(0.12, 0.38, 0.24),
	]
	return colors[idx % colors.size()]

func _make_tree(pos: Vector3, scale: float, idx: int) -> void:
	var tree := Node3D.new()
	add_child(tree)
	tree.position = pos
	tree.scale = Vector3(scale, scale, scale)

	var trunk_mat := StandardMaterial3D.new()
	trunk_mat.albedo_color = Color(0.34, 0.24, 0.16)
	var trunk := MeshInstance3D.new()
	tree.add_child(trunk)
	var trunk_mesh := CylinderMesh.new()
	trunk_mesh.top_radius = 0.18
	trunk_mesh.bottom_radius = 0.32
	trunk_mesh.height = 3.0
	trunk.mesh = trunk_mesh
	trunk.position.y = 1.5
	trunk.material_override = trunk_mat

	# Two overlapping canopy clumps -> fuller, hand-drawn silhouette.
	var c1 := MeshInstance3D.new()
	tree.add_child(c1)
	var c1_mesh := SphereMesh.new()
	c1_mesh.radius = 1.7
	c1_mesh.height = 3.4
	c1.mesh = c1_mesh
	c1.position.y = 3.9
	var c1_mat := StandardMaterial3D.new()
	c1_mat.albedo_color = _tree_canopy_color(idx)
	c1.material_override = c1_mat

	var c2 := MeshInstance3D.new()
	tree.add_child(c2)
	var c2_mesh := SphereMesh.new()
	c2_mesh.radius = 1.2
	c2_mesh.height = 2.4
	c2.mesh = c2_mesh
	c2.position = Vector3(0.7, 4.7, -0.4)
	var c2_mat := StandardMaterial3D.new()
	c2_mat.albedo_color = _tree_canopy_color(idx + 2)
	c2.material_override = c2_mat

	var body := StaticBody3D.new()
	tree.add_child(body)
	var col_shape := CollisionShape3D.new()
	var col := CylinderShape3D.new()
	col.radius = 0.35
	col.height = 3.0
	col_shape.shape = col
	col_shape.position.y = 1.5
	body.add_child(col_shape)

func _build_forest() -> void:
	# Two dense rings enclose a central clearing (~radius 11 kept open for
	# play); jitter comes from deterministic sin() so the preview matches.
	var rings := [
		{"r": 15.0, "count": 26, "scale": 1.25},
		{"r": 20.0, "count": 30, "scale": 1.5},
	]
	var idx := 0
	for ring in rings:
		var count: int = ring["count"]
		for i in range(count):
			var ang := TAU * float(i) / float(count)
			var r: float = ring["r"] + 2.2 * sin(i * 1.7)
			var pos := Vector3(cos(ang) * r, 0.0, sin(ang) * r)
			var s: float = ring["scale"] * (0.85 + 0.25 * sin(i * 2.3 + 1.0))
			_make_tree(pos, s, idx)
			idx += 1

	# A few inner trees at the clearing edge for depth (hand-placed).
	var inner := [
		Vector3(-11, 0, -6), Vector3(11, 0, 4), Vector3(9, 0, -9),
		Vector3(-12, 0, 3), Vector3(12, 0, -3), Vector3(-6, 0, 10),
	]
	for pos in inner:
		_make_tree(pos, 1.05, idx)
		idx += 1

func _build_undergrowth() -> void:
	# Low leafy bushes filling the space beneath the tree line.
	var bush_positions := [
		Vector2(-13, -4), Vector2(-8, -7), Vector2(10, -6), Vector2(13, 1),
		Vector2(-13, 5), Vector2(8, 8), Vector2(-9, 9), Vector2(4, 10),
		Vector2(-5, -8), Vector2(12, -8), Vector2(-2, 10), Vector2(6, -9),
	]
	var idx := 0
	for p in bush_positions:
		var bush := Node3D.new()
		add_child(bush)
		bush.position = Vector3(p.x, 0, p.y)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = _tree_canopy_color(idx + 1)
		for j in range(3):
			var blob := MeshInstance3D.new()
			bush.add_child(blob)
			var m := SphereMesh.new()
			m.radius = 0.6
			m.height = 1.0
			blob.mesh = m
			blob.position = Vector3((j - 1) * 0.55, 0.45, sin(j) * 0.3)
			blob.material_override = mat
		idx += 1

func _build_cottage() -> void:
	var cottage := Node3D.new()
	add_child(cottage)
	cottage.position = COTTAGE_POS
	cottage.rotation_degrees.y = 40.0

	var wall_mat := StandardMaterial3D.new()
	wall_mat.albedo_color = Color(0.88, 0.80, 0.64)
	var roof_mat := StandardMaterial3D.new()
	roof_mat.albedo_color = Color(0.55, 0.28, 0.22)
	var wood_mat := StandardMaterial3D.new()
	wood_mat.albedo_color = Color(0.35, 0.24, 0.15)

	var walls := MeshInstance3D.new()
	var wall_mesh := BoxMesh.new()
	wall_mesh.size = Vector3(4.0, 2.6, 3.5)
	walls.mesh = wall_mesh
	walls.material_override = wall_mat
	walls.position.y = 1.3
	cottage.add_child(walls)

	# Conical shingled roof (like the treehouses in the reference).
	var roof := MeshInstance3D.new()
	var roof_mesh := CylinderMesh.new()
	roof_mesh.top_radius = 0.0
	roof_mesh.bottom_radius = 3.2
	roof_mesh.height = 2.8
	roof_mesh.radial_segments = 8
	roof.mesh = roof_mesh
	roof.material_override = roof_mat
	roof.position.y = 4.0
	cottage.add_child(roof)

	var door := MeshInstance3D.new()
	var door_mesh := BoxMesh.new()
	door_mesh.size = Vector3(0.9, 1.7, 0.15)
	door.mesh = door_mesh
	door.material_override = wood_mat
	door.position = Vector3(0, 0.85, 1.78)
	cottage.add_child(door)

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

	# Warm light spilling from the window.
	var lamp := OmniLight3D.new()
	lamp.position = Vector3(1.6, 1.6, 2.4)
	lamp.light_color = Color(1.0, 0.75, 0.4)
	lamp.light_energy = 3.0
	lamp.omni_range = 8.0
	cottage.add_child(lamp)
	_dusk_lights.append(lamp)

	var chimney := MeshInstance3D.new()
	var chim_mesh := BoxMesh.new()
	chim_mesh.size = Vector3(0.5, 1.2, 0.5)
	chimney.mesh = chim_mesh
	chimney.material_override = roof_mat
	chimney.position = Vector3(-1.3, 3.6, 0)
	cottage.add_child(chimney)

	_add_smoke(cottage, Vector3(-1.3, 4.4, 0))

	var body := StaticBody3D.new()
	cottage.add_child(body)
	var shape := CollisionShape3D.new()
	var col := BoxShape3D.new()
	col.size = Vector3(4.0, 2.6, 3.5)
	shape.shape = col
	shape.position.y = 1.3
	body.add_child(shape)

func _build_treehouse() -> void:
	# Placeholder for the stilted treehouse-village look (reference img 3):
	# a raised cabin on stilts, plus a short plank rope-bridge to a platform.
	var wood := StandardMaterial3D.new()
	wood.albedo_color = Color(0.42, 0.30, 0.20)
	var roof_mat := StandardMaterial3D.new()
	roof_mat.albedo_color = Color(0.50, 0.34, 0.24)
	var rope_mat := StandardMaterial3D.new()
	rope_mat.albedo_color = Color(0.55, 0.45, 0.30)

	var base := Vector3(13, 0, -6)
	var platform_h := 2.6

	# Stilts
	for off in [Vector3(-1.3, 0, -1.3), Vector3(1.3, 0, -1.3), Vector3(-1.3, 0, 1.3), Vector3(1.3, 0, 1.3)]:
		var stilt := MeshInstance3D.new()
		var sm := CylinderMesh.new()
		sm.top_radius = 0.16
		sm.bottom_radius = 0.20
		sm.height = platform_h
		stilt.mesh = sm
		stilt.material_override = wood
		stilt.position = base + off + Vector3(0, platform_h * 0.5, 0)
		add_child(stilt)

	# Platform
	var platform := MeshInstance3D.new()
	var pm := BoxMesh.new()
	pm.size = Vector3(3.4, 0.25, 3.4)
	platform.mesh = pm
	platform.material_override = wood
	platform.position = base + Vector3(0, platform_h, 0)
	add_child(platform)

	# Cabin + conical roof
	var cabin := MeshInstance3D.new()
	var cm := BoxMesh.new()
	cm.size = Vector3(2.6, 2.2, 2.6)
	cabin.mesh = cm
	cabin.material_override = wood
	cabin.position = base + Vector3(0, platform_h + 1.1, 0)
	add_child(cabin)

	var roof := MeshInstance3D.new()
	var rm := CylinderMesh.new()
	rm.top_radius = 0.0
	rm.bottom_radius = 2.2
	rm.height = 2.2
	rm.radial_segments = 8
	roof.mesh = rm
	roof.material_override = roof_mat
	roof.position = base + Vector3(0, platform_h + 3.3, 0)
	add_child(roof)

	# A small landing platform the bridge connects to.
	var landing := Vector3(8.5, 0, -8)
	for off in [Vector3(-0.9, 0, -0.9), Vector3(0.9, 0, -0.9), Vector3(-0.9, 0, 0.9), Vector3(0.9, 0, 0.9)]:
		var stilt2 := MeshInstance3D.new()
		var sm2 := CylinderMesh.new()
		sm2.top_radius = 0.14
		sm2.bottom_radius = 0.18
		sm2.height = platform_h
		stilt2.mesh = sm2
		stilt2.material_override = wood
		stilt2.position = landing + off + Vector3(0, platform_h * 0.5, 0)
		add_child(stilt2)
	var land_plat := MeshInstance3D.new()
	var lpm := BoxMesh.new()
	lpm.size = Vector3(2.4, 0.22, 2.4)
	land_plat.mesh = lpm
	land_plat.material_override = wood
	land_plat.position = landing + Vector3(0, platform_h, 0)
	add_child(land_plat)

	# Rope bridge: planks along the span + two rope rails, with a gentle sag.
	var start := base + Vector3(-1.7, platform_h, 0)
	var end := landing + Vector3(1.2, platform_h, 0)
	var planks := 9
	for i in range(planks + 1):
		var t := float(i) / float(planks)
		var p := start.lerp(end, t)
		var sag := sin(t * PI) * 0.5
		p.y -= sag
		if i < planks:
			var plank := MeshInstance3D.new()
			var plm := BoxMesh.new()
			plm.size = Vector3(1.3, 0.08, 0.5)
			plank.mesh = plm
			plank.material_override = wood
			plank.position = p
			plank.look_at(end, Vector3.UP)
			add_child(plank)
		# rope rails
		for side in [-0.6, 0.6]:
			var rope := MeshInstance3D.new()
			var rmm := BoxMesh.new()
			rmm.size = Vector3(0.05, 0.05, 0.05)
			rope.mesh = rmm
			rope.material_override = rope_mat
			rope.position = p + Vector3(side, 0.6, 0)
			add_child(rope)

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
	smoke.process_material = pm

	var quad := QuadMesh.new()
	quad.size = Vector2(0.6, 0.6)
	var vm := StandardMaterial3D.new()
	vm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	vm.albedo_color = Color(0.85, 0.82, 0.8, 0.35)
	vm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	quad.material = vm
	smoke.draw_pass_1 = quad

func _scatter_flora() -> void:
	var stem_mat := StandardMaterial3D.new()
	stem_mat.albedo_color = Color(0.28, 0.42, 0.20)
	var idx := 0
	for p in FLOWERS:
		var flower := Node3D.new()
		add_child(flower)
		flower.position = Vector3(p.x, 0, p.y)
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
		bloom_mat.albedo_color = FLOWER_COLORS[idx % FLOWER_COLORS.size()]
		bloom.material_override = bloom_mat
		flower.add_child(bloom)
		idx += 1

	# Toadstools (red caps, white stems) — a Ghibli-forest staple.
	var cap_mat := StandardMaterial3D.new()
	cap_mat.albedo_color = Color(0.82, 0.22, 0.18)
	var mush_stem_mat := StandardMaterial3D.new()
	mush_stem_mat.albedo_color = Color(0.92, 0.88, 0.78)
	for p in MUSHROOMS:
		var mush := Node3D.new()
		add_child(mush)
		mush.position = Vector3(p.x, 0, p.y)
		var stem := MeshInstance3D.new()
		var sm := CylinderMesh.new()
		sm.top_radius = 0.08
		sm.bottom_radius = 0.10
		sm.height = 0.35
		stem.mesh = sm
		stem.position.y = 0.17
		stem.material_override = mush_stem_mat
		mush.add_child(stem)
		var cap := MeshInstance3D.new()
		var cm := SphereMesh.new()
		cm.radius = 0.22
		cm.height = 0.3
		cap.mesh = cm
		cap.position.y = 0.36
		cap.scale.y = 0.6
		cap.material_override = cap_mat
		mush.add_child(cap)

	var rock_mat := StandardMaterial3D.new()
	rock_mat.albedo_color = Color(0.48, 0.50, 0.50)
	for p in ROCKS:
		var rock := MeshInstance3D.new()
		var rm := SphereMesh.new()
		rm.radius = 0.4
		rm.height = 0.55
		rock.mesh = rm
		rock.scale = Vector3(1.0, 0.6, 0.8)
		rock.position = Vector3(p.x, 0.14, p.y)
		rock.material_override = rock_mat
		add_child(rock)

	# Ferns: fans of tall thin blades.
	var fern_mat := StandardMaterial3D.new()
	fern_mat.albedo_color = Color(0.20, 0.44, 0.18)
	for p in FERNS:
		var fern := Node3D.new()
		add_child(fern)
		fern.position = Vector3(p.x, 0, p.y)
		for j in range(5):
			var blade := MeshInstance3D.new()
			var bm := CylinderMesh.new()
			bm.top_radius = 0.0
			bm.bottom_radius = 0.07
			bm.height = 0.9
			blade.mesh = bm
			blade.material_override = fern_mat
			var a := (j - 2) * 0.35
			blade.position = Vector3(sin(a) * 0.25, 0.4, cos(a) * 0.1)
			blade.rotation.z = a
			fern.add_child(blade)

func _spawn_ambient_particles() -> void:
	var particles := GPUParticles3D.new()
	add_child(particles)
	particles.position = Vector3(0, 2.0, 0)
	particles.amount = 60
	particles.lifetime = 7.0
	particles.preprocess = 7.0
	particles.emitting = true

	var process_mat := ParticleProcessMaterial.new()
	process_mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	process_mat.emission_box_extents = Vector3(18, 3, 18)
	process_mat.direction = Vector3(0, 1, 0)
	process_mat.spread = 180.0
	process_mat.gravity = Vector3.ZERO
	process_mat.initial_velocity_min = 0.1
	process_mat.initial_velocity_max = 0.3
	process_mat.scale_min = 0.03
	process_mat.scale_max = 0.09
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

func _spawn_fairy_motes() -> void:
	# Larger, slow, colored glows drifting near the stream (reference img 4).
	var motes := GPUParticles3D.new()
	add_child(motes)
	motes.position = Vector3(-6, 1.0, -6)
	motes.amount = 14
	motes.lifetime = 5.0
	motes.preprocess = 5.0
	motes.emitting = true

	var pm := ParticleProcessMaterial.new()
	pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	pm.emission_box_extents = Vector3(8, 1.5, 4)
	pm.direction = Vector3(0.2, 0.3, 0)
	pm.spread = 60.0
	pm.gravity = Vector3(0, 0.05, 0)
	pm.initial_velocity_min = 0.2
	pm.initial_velocity_max = 0.5
	pm.scale_min = 0.1
	pm.scale_max = 0.25
	motes.process_material = pm

	var quad := QuadMesh.new()
	quad.size = Vector2(0.3, 0.3)
	var vm := StandardMaterial3D.new()
	vm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	vm.albedo_color = Color(0.7, 1.0, 0.8, 0.9)
	vm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	vm.emission_enabled = true
	vm.emission = Color(0.5, 1.0, 0.7)
	vm.emission_energy_multiplier = 3.0
	quad.material = vm
	motes.draw_pass_1 = quad

func _build_tend_patches() -> void:
	for p in WITHERED:
		var patch = TEND_PATCH_SCENE.instantiate()
		patch.position = Vector3(p.x, 0.0, p.y)
		add_child(patch)

# --- Cel shading -------------------------------------------------------
func _apply_toon_shading() -> void:
	_toonify(self)

func _toonify(node: Node) -> void:
	for child in node.get_children():
		if child is MeshInstance3D:
			var m = child.material_override
			# Only solid, lit, opaque surfaces get toon-shaded — leave
			# emissive (windows, particles) and transparent (water) alone.
			if m is StandardMaterial3D and not m.emission_enabled \
					and m.transparency == BaseMaterial3D.TRANSPARENCY_DISABLED:
				var tm := ShaderMaterial.new()
				tm.shader = TOON_SHADER
				tm.set_shader_parameter("albedo", m.albedo_color)
				child.material_override = tm
		_toonify(child)

# --- Day -> dusk cycle -------------------------------------------------
func _process(delta: float) -> void:
	if _sky_mat == null or day_cycle_speed <= 0.0:
		return
	_phase += delta * day_cycle_speed
	# Smooth ping-pong between morning (0) and dusk (1).
	var t := 0.5 - 0.5 * cos(_phase * TAU)
	_apply_time_of_day(t)

func _apply_time_of_day(t: float) -> void:
	sun.rotation_degrees = Vector3(-45, -52, 0).lerp(Vector3(-12, -68, 0), t)
	sun.light_color = Color(1.0, 0.94, 0.82).lerp(Color(1.0, 0.6, 0.35), t)
	sun.light_energy = lerp(1.45, 1.05, t)

	_sky_mat.sky_top_color = Color(0.35, 0.55, 0.78).lerp(Color(0.26, 0.28, 0.52), t)
	_sky_mat.sky_horizon_color = Color(0.88, 0.90, 0.92).lerp(Color(1.0, 0.62, 0.42), t)
	_sky_mat.ground_horizon_color = _sky_mat.sky_horizon_color

	_env.fog_light_color = Color(0.90, 0.90, 0.92).lerp(Color(1.0, 0.72, 0.5), t)

	# Windows/lanterns glow up as it gets dark.
	var lamp_energy := lerp(0.6, 4.0, t)
	for l in _dusk_lights:
		if is_instance_valid(l):
			l.light_energy = lamp_energy

func _spawn_animals() -> void:
	var configs := [
		{"pos": Vector3(4, 0, 4), "name": "Fox", "problem": "A thorn is stuck in my paw...", "thanks": "Yip! All better, little warden.", "color": Color(0.85, 0.45, 0.2)},
		{"pos": Vector3(-5, 0, 5), "name": "Rabbit", "problem": "I can't find my way back to my burrow...", "thanks": "Thank you for showing me the way!", "color": Color(0.85, 0.8, 0.75)},
		{"pos": Vector3(8, 0, 7), "name": "Deer", "problem": "A fallen branch is blocking my path...", "thanks": "The path is clear now. My thanks.", "color": Color(0.6, 0.45, 0.3)},
	]
	for cfg in configs:
		var animal = ANIMAL_SCENE.instantiate()
		animal.position = cfg["pos"]
		animal.animal_name = cfg["name"]
		animal.problem_text = cfg["problem"]
		animal.thanks_text = cfg["thanks"]
		animal.body_color = cfg["color"]
		add_child(animal)
