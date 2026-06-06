export const enum State {
	None,
	Turn,
	GainKE, // gain kinetic energy
	ResetLevel,
}

type Timer = ReturnType<typeof setTimeout>;

export type Action = {
	turn: () => void;
	gain_ke: () => void;
	reset_level: () => void;
};

// 拓展性不是一般的差
export class Controller {
	private state = State.None;
	private timer: Timer | null = null;

	constructor(private action: Action) {}

	private clear_timer() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}

	press() {
		this.clear_timer();

		this.state = State.Turn;
		this.timer = setTimeout(() => {
			this.state = State.GainKE;
			this.timer = setTimeout(() => {
				this.state = State.ResetLevel;
				this.action.reset_level();
				this.timer = null;
			}, 2800);
		}, 200);
	}

	release() {
		this.clear_timer();

		if (this.state === State.Turn) {
			this.action.turn();
		} else if (this.state === State.GainKE) {
			this.action.gain_ke();
		}

		this.state = State.None;
	}
}
