import { Model, ModelState } from "./model.ts";
import { View, CANVAS_W, CANVAS_H, type ViewData } from "./view.ts";
import { Controller } from "./controller.ts";
import { levels } from "./level/level.ts";

const to_view_data = (model: Model): ViewData => {
	const all_x = [...model.grounds.map(g => g.position.x), ...model.static_blocks.map(s => s.position.x)];
	const all_y = [...model.grounds.map(g => g.position.y), ...model.static_blocks.map(s => s.position.y)];
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

const resize_canvas = (canvas: HTMLCanvasElement) => {
	const maxW = window.innerWidth;
	const maxH = window.innerHeight;
	const scale = Math.min(maxW / CANVAS_W, maxH / CANVAS_H) * 0.8;
	canvas.style.width = `${CANVAS_W * scale}px`;
	canvas.style.height = `${CANVAS_H * scale}px`;
};

async function main() {
	const canvas = document.createElement("canvas");
	document.body.appendChild(canvas);
	document.body.style.margin = "0";
	document.body.style.display = "flex";
	document.body.style.justifyContent = "center";
	document.body.style.alignItems = "center";
	document.body.style.height = "100dvh";
	document.body.style.overflow = "hidden";

	window.addEventListener("resize", () => resize_canvas(canvas));
	window.addEventListener("orientationchange", () => {
		setTimeout(() => resize_canvas(canvas), 100);
	});

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
	window.addEventListener("touchstart", e => {
		e.preventDefault();
		controller.press();
	});
	window.addEventListener("touchend", e => {
		e.preventDefault();
		controller.release();
	});

	const TICK_MS = 200;
	let accumulator = 0;
	let last_time = performance.now();

	const game_loop = (now: number) => {
		const delta = now - last_time;
		last_time = now;
		accumulator += delta;

		controller.tick();

		if (model.status === ModelState.Won) {
			if (level_index < levels.length - 1) {
				level_index++;
				load_level();
			}
		} else {
			while (accumulator >= TICK_MS) {
				model.step();
				accumulator -= TICK_MS;
			}
		}

		view.update(to_view_data(model));
		resize_canvas(canvas);

		requestAnimationFrame(game_loop);
	};

	requestAnimationFrame(game_loop);
}

main().catch(console.error);
