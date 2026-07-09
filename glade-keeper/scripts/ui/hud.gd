extends CanvasLayer

@onready var prompt_label: Label = $PromptLabel

func show_prompt(text: String) -> void:
	prompt_label.text = "Press E — " + text

func hide_prompt() -> void:
	prompt_label.text = ""
