extends Node

var current_map = null
var map_count := 0
var map_boundary: Rect2
var _maps: Array = []

onready var _main = get_tree().current_scene


func find_maps():
	var path: String = "res://games/pixel_side_scroller/maps"
	var map_names: Array = []
	var dir: Directory = Directory.new()
	if dir.open(path) != OK:
		push_error("Could not open directory %s" % path)
		return
	if dir.list_dir_begin(true, true) != OK:
		push_error("Could list_dir_begin directory %s" % path)
		return
	while true:
		var file: String = dir.get_next()
		if file == "":
			break
		if file.begins_with("."):
			continue
		if not file.ends_with(".tscn"):
			continue
		map_names.append(file.split(".")[0])
	dir.list_dir_end()
	map_names.sort()
	_maps = map_names
	map_count = map_names.size()


func load_next_map() -> bool:
	if _maps.size() == 0:
		return false
	var valid_map: bool = _load_map(_maps[0])
	_maps.pop_front()
	if not valid_map:
		map_count -= 1
		return load_next_map()
	_main.spawn_player()
	return true


func _load_map(name_name: String) -> bool:
	if current_map:
		current_map.queue_free()
	var new_map_load = load("res://games/pixel_side_scroller/maps/" + name_name + ".tscn")
	if not new_map_load:
		return false
	var new_map = new_map_load.instance()
	# Check for spawn and goal
	if (
		not is_instance_valid(new_map.get_node("Spawn"))
		or not is_instance_valid(new_map.get_node("Goal"))
	):
		push_error("ERROR: map '%s' is not valid! missing spawn or goal" % name_name)
		return false
	current_map = new_map
	map_boundary = _calculate_map_boundary(new_map)
	call_deferred("add_child", new_map)
	return true


func out_of_bound(object) -> bool:
	var boundary: Rect2 = map_boundary
	if (
		object.position.x < boundary.position.x
		or object.position.x > boundary.end.x
		or object.position.y < boundary.position.y
		or object.position.y > boundary.end.y
	):
		return true
	return false


func _calculate_map_boundary(map) -> Rect2:
	var boundary: Rect2 = Rect2(Vector2.ZERO, Vector2.ZERO)
	for child in map.get_children():
		match child.get_class():
			"Label":
				boundary = boundary.expand(child.rect_position)
			"TileMap":
				var tilemap_boundary: Rect2 = child.get_used_rect()
				boundary = boundary.expand(tilemap_boundary.position * 8)
				boundary = boundary.expand(tilemap_boundary.end * 8)
			"Node2D":
				boundary = boundary.expand(child.position)

	var boundary_margin: float = 16.0 * 8.0
	boundary = boundary.grow(boundary_margin)
	return boundary
