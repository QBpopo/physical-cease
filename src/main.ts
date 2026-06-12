import { Model, ModelState, dir_offset } from "./model.ts";
import { View, CANVAS_W, CANVAS_H, CELL_SIZE, type ViewData } from "./view.ts";
import { Controller } from "./controller.ts";
import { levels } from "./level/level.ts";

const TICK_MS = 200;
const SPEED_SCALE = CELL_SIZE / (TICK_MS * Math.sqrt(2 * 5));

const calc_move_duration = (model: Model): number => {
	const ke = Math.max(model.block.current_kinetic_energy, 0.1);
	const speed = Math.sqrt(2 * ke) * SPEED_SCALE;
	return Math.min(CELL_SIZE / speed, TICK_MS);
};

const calc_anim_progress = (acc: number, move_dur: number): number => {
	return Math.min(acc / Math.max(move_dur, 1), 1);
};

const to_view_data = (model: Model, transition_progress = 0, anim_progress = 0): ViewData => {
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
		die_progress: model.die_progress(),
		fall_progress: model.fall_progress(),
		fall_dir_x: dir_offset(model.block.velocity_dir)[0],
		fall_dir_y: dir_offset(model.block.velocity_dir)[1],
		bounce_progress: model.bounce_progress(),
		bounce_dir: model.block.velocity_dir,
		anim_progress,
		transition_progress,
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
		model.reset_level();
		view.reset_static();
		view.update(to_view_data(model, 0, 0));
	};

	view.update(to_view_data(model, 0, 0));

	const action = {
		turn: () => {
			model.turn();
			view.update(to_view_data(model, 0, 0));
		},
		gain_ke: () => {
			model.gain_ke();
			view.update(to_view_data(model, 0, 0));
		},
		reset_level: () => {
			model.reset_level();
			view.update(to_view_data(model, 0, 0));
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

	let accumulator = 0;
	let last_time = performance.now();
	let transition_elapsed = 0;
	const TRANSITION_DURATION = 1200;

	const game_loop = (now: number) => {
		const dt = now - last_time;
		last_time = now;
		accumulator += dt;
		controller.tick();
		model.tick_bounce(dt);

		let tp = 0; // transition_progress
		let ap = 0; // anim_progress

		if (transition_elapsed > 0) {
			transition_elapsed += dt;
			tp = Math.min(transition_elapsed / TRANSITION_DURATION, 1);
			if (tp >= 1) {
				transition_elapsed = 0;
				accumulator = 0;
				if (level_index < levels.length - 1) {
					level_index++;
				} else {
					level_index = 0;
				}
				load_level();
			}
		} else if (model.status === ModelState.Won) {
			transition_elapsed = dt;
		} else if (model.status === ModelState.Falling) {
			if (model.tick_fall(dt)) accumulator = 0;
		} else if (model.status === ModelState.Dying) {
			if (model.tick_die(dt)) accumulator = 0;
		} else {
			const move_dur = calc_move_duration(model);
			while (accumulator >= TICK_MS) {
				model.step();
				accumulator -= TICK_MS;
			}
			ap = calc_anim_progress(accumulator, move_dur);
		}

		view.update(to_view_data(model, tp, ap));
		resize_canvas(canvas);
		requestAnimationFrame(game_loop);
	};

	requestAnimationFrame(game_loop);
}

main().catch(console.error);
