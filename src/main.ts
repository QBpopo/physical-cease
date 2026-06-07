import { Model, ModelState } from "./model.ts";
import { View, type ViewData } from "./view.ts";
import { Controller } from "./controller.ts";
import { levels } from "./level/level.ts";

const to_view_data = (model: Model): ViewData => {
	const all_x = [
		...model.grounds.map(g => g.position.x),
		...model.static_blocks.map(s => s.position.x),
		model.block.position.x,
		model.end_zone.position.x,
		model.key.position.x,
	];
	const all_y = [
		...model.grounds.map(g => g.position.y),
		...model.static_blocks.map(s => s.position.y),
		model.block.position.y,
		model.end_zone.position.y,
		model.key.position.y,
	];
	const min_x = Math.min(...all_x);
	const max_x = Math.max(...all_x);
	const min_y = Math.min(...all_y);
	const max_y = Math.max(...all_y);

	return {
		grounds: model.grounds,
		static_blocks: model.static_blocks,
		block: model.block,
		end_zone: model.end_zone,
		key: model.key,
		is_key_visible: !model.has_key,
		target_ke: model.target_kinetic_energy,
		current_ke: model.block.current_kinetic_energy,
		camera: { x: (min_x + max_x) / 2, y: (min_y + max_y) / 2 },
	};
};

async function main() {
	const canvas = document.createElement("canvas");
	canvas.style.maxWidth = "80vw";
	canvas.style.maxHeight = "80vh";
	document.body.appendChild(canvas);
	document.body.style.margin = "0";
	document.body.style.display = "flex";
	document.body.style.justifyContent = "center";
	document.body.style.alignItems = "center";
	document.body.style.height = "100vh";
	document.body.style.overflow = "hidden";

	let level_index = 0;
	let model = levels[level_index]!;

	const view = new View();
	await view.init(canvas);

	const load_level = () => {
		model = levels[level_index]!;
		view.reset_static();
		view.update(to_view_data(model));
	};

	view.update(to_view_data(model));

	const action = {
		turn: () => {
			model.turn();
			view.update(to_view_data(model));
		},
		gain_ke: () => {
			model.gain_ke();
			view.update(to_view_data(model));
		},
		reset_level: () => {
			model.reset_level();
			view.update(to_view_data(model));
		},
	};

	const controller = new Controller(action);

	window.addEventListener("mousedown", () => controller.press());
	window.addEventListener("mouseup", () => controller.release());
	window.addEventListener("touchstart", () => controller.press());
	window.addEventListener("touchend", () => controller.release());

	// Game loop for logical ticks
	setInterval(() => {
		if (model.status === ModelState.Won) {
			if (level_index < levels.length - 1) {
				level_index++;
				load_level();
			}
			return;
		}

		if (model.block.current_kinetic_energy > 0) {
			model.step();
			view.update(to_view_data(model));
		}
	}, 200);
}

main().catch(console.error);
