extends CharacterBody3D

const SPEED := 4.0
const RUN_SPEED := 7.0
const GRAVITY := 9.8
const MOUSE_SENSITIVITY := 0.003

@onready var body_mesh: Node3D = $Model
@onready var camera_pivot: Node3D = $CameraPivot
@onready var spring_arm: SpringArm3D = $CameraPivot/SpringArm3D
@onready var interact_zone: Area3D = $InteractZone

# Kept untyped on purpose: hud/nearby animals hold custom-scripted nodes
# (HUD, AnimalNPC) and calling their custom methods on a duck-typed var
# avoids GDScript's static "unknown member" errors. See CLAUDE.md.
var hud
var nearby_targets: Array = []
var interact_was_pressed := false

const INTERACT_GROUPS := ["animal", "tendable"]

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	interact_zone.body_entered.connect(_on_interact_zone_body_entered)
	interact_zone.body_exited.connect(_on_interact_zone_body_exited)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		camera_pivot.rotate_y(-event.relative.x * MOUSE_SENSITIVITY)
		spring_arm.rotate_x(-event.relative.y * MOUSE_SENSITIVITY)
		spring_arm.rotation.x = clamp(spring_arm.rotation.x, deg_to_rad(-40), deg_to_rad(10))
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= GRAVITY * delta
	else:
		velocity.y = 0.0

	# Movement is relative to where the camera looks horizontally,
	# not to the body's own rotation (the body only turns to face
	# where it's walking, purely cosmetic, see below).
	var forward := -camera_pivot.global_transform.basis.z
	var right := camera_pivot.global_transform.basis.x
	forward.y = 0.0
	right.y = 0.0
	forward = forward.normalized()
	right = right.normalized()

	var move_dir := Vector3.ZERO
	if Input.is_physical_key_pressed(KEY_W):
		move_dir += forward
	if Input.is_physical_key_pressed(KEY_S):
		move_dir -= forward
	if Input.is_physical_key_pressed(KEY_D):
		move_dir += right
	if Input.is_physical_key_pressed(KEY_A):
		move_dir -= right
	if move_dir.length() > 0.0:
		move_dir = move_dir.normalized()

	var speed := RUN_SPEED if Input.is_physical_key_pressed(KEY_SHIFT) else SPEED
	velocity.x = move_dir.x * speed
	velocity.z = move_dir.z * speed

	if move_dir.length() > 0.01:
		var target_angle := atan2(move_dir.x, move_dir.z)
		body_mesh.rotation.y = lerp_angle(body_mesh.rotation.y, target_angle, 10.0 * delta)

	move_and_slide()
	if body_mesh.has_method("set_move_speed"):
		body_mesh.set_move_speed(Vector2(velocity.x, velocity.z).length())
	_handle_interact()

func _handle_interact() -> void:
	var pressed := Input.is_physical_key_pressed(KEY_E)
	if pressed and not interact_was_pressed:
		_try_interact()
	interact_was_pressed = pressed

func _try_interact() -> void:
	var target = _nearest_target()
	if target and target.has_method("interact"):
		if body_mesh.has_method("play_cast"):
			body_mesh.play_cast()
		target.interact()
		# Refresh the prompt: it may have resolved (helped/tended).
		nearby_targets.erase(target)
		_refresh_prompt()

func _nearest_target():
	var nearest = null
	var nearest_dist := INF
	for t in nearby_targets:
		if not is_instance_valid(t):
			continue
		var dist: float = global_position.distance_to(t.global_position)
		if dist < nearest_dist:
			nearest_dist = dist
			nearest = t
	return nearest

func _is_interactable(body: Node3D) -> bool:
	for g in INTERACT_GROUPS:
		if body.is_in_group(g):
			return true
	return false

func _refresh_prompt() -> void:
	if not hud:
		return
	var target = _nearest_target()
	if target and "problem_text" in target:
		hud.show_prompt(target.problem_text)
	elif target:
		hud.show_prompt("help")
	else:
		hud.hide_prompt()

func _on_interact_zone_body_entered(body: Node3D) -> void:
	if _is_interactable(body):
		nearby_targets.append(body)
		_refresh_prompt()

func _on_interact_zone_body_exited(body: Node3D) -> void:
	nearby_targets.erase(body)
	_refresh_prompt()
