export type Action = {
	turn: () => void;
	gain_ke: () => void;
	reset_level: () => void;
};

const TURN_THRESHOLD = 200;
const RESET_THRESHOLD = 3000;

export class Controller {
	private press_time = 0;
	private pressed = false;

	constructor(private action: Action) {}

	press() {
		this.press_time = performance.now();
		this.pressed = true;
	}

	release() {
		if (!this.pressed) return;
		this.pressed = false;

		const elapsed = performance.now() - this.press_time;
		if (elapsed < TURN_THRESHOLD) {
			this.action.turn();
		} else if (elapsed < RESET_THRESHOLD) {
			this.action.gain_ke();
		} else {
			this.action.reset_level();
		}
	}

	tick() {
		if (!this.pressed) return;
		if (performance.now() - this.press_time >= RESET_THRESHOLD) {
			this.pressed = false;
			this.action.reset_level();
		}
	}
}
