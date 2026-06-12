import { Application, Graphics, Container, Text } from "pixi.js";
import { Direction } from "./components.ts";
import type { Block, EndZone, Ground, Key, StaticBlock } from "./entities.ts";

export const CANVAS_W = 800;
export const CANVAS_H = 600;
export const CELL_SIZE = 64;

export interface ViewData {
	grounds: Ground[];
	static_blocks: StaticBlock[];
	block: Block;
	end_zone: EndZone;
	key: Key;
	is_key_visible: boolean;
	target_ke: number;
	current_ke: number;
	camera: { x: number; y: number };
	die_progress: number;
	fall_progress: number;
	fall_dir_x: number;
	fall_dir_y: number;
	bounce_progress: number;
	bounce_dir: Direction;
	anim_progress: number;
	transition_progress: number;
}

export class View {
	public app = new Application();

	private block_graphics = new Graphics();
	private grounds_container = new Container();
	private static_blocks_container = new Container();
	private keys_container = new Container();
	private end_zones_container = new Container();
	private state_text = new Text({ text: "", style: { fill: 0x000 } });

	private static_drawn = false;

	private anim_from_x = 0;
	private anim_from_y = 0;
	private anim_target_x = 0;
	private anim_target_y = 0;
	private anim_initialized = false;
	private anim_progress = 0;

	async init(canvas: HTMLCanvasElement) {
		await this.app.init({
			canvas,
			width: CANVAS_W,
			height: CANVAS_H,
			backgroundColor: 0xffffff,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			antialias: true,
		});

		this.app.stage.addChild(this.grounds_container);
		this.app.stage.addChild(this.end_zones_container);
		this.app.stage.addChild(this.keys_container);
		this.app.stage.addChild(this.static_blocks_container);

		this.block_graphics.zIndex = 10;
		this.app.stage.addChild(this.block_graphics);

		this.state_text.x = 10;
		this.state_text.y = 10;
		this.app.stage.addChild(this.state_text);
	}

	update(data: ViewData) {
		this.camera_x = data.camera.x;
		this.camera_y = data.camera.y;

		const bx = data.block.position.x;
		const by = data.block.position.y;

		this.anim_progress = Math.max(this.anim_progress, data.anim_progress);

		if (data.fall_progress > 0) {
			if (this.anim_target_x !== bx || this.anim_target_y !== by) {
				this.anim_from_x = this.anim_x();
				this.anim_from_y = this.anim_y();
				this.anim_target_x = bx;
				this.anim_target_y = by;
			}
			this.anim_progress = Math.min(data.fall_progress * 4, 1);
		} else if (!this.anim_initialized) {
			this.anim_from_x = bx;
			this.anim_from_y = by;
			this.anim_target_x = bx;
			this.anim_target_y = by;
			this.anim_initialized = true;
		} else if (bx !== this.anim_target_x || by !== this.anim_target_y) {
			const jump = Math.abs(bx - this.anim_target_x) + Math.abs(by - this.anim_target_y);
			if (jump <= 2) {
				// normal / bounce: snap to old target for perfect alignment
				this.anim_from_x = this.anim_target_x;
				this.anim_from_y = this.anim_target_y;
			} else {
				// teleport: no animation
				this.anim_from_x = bx;
				this.anim_from_y = by;
			}
			this.anim_target_x = bx;
			this.anim_target_y = by;
			this.anim_progress = 0;
		}

		if (!this.static_drawn) {
			this.draw_grounds(data);
			this.draw_end_zone(data);
			this.draw_static_blocks(data);
			this.static_drawn = true;
		}

		this.draw_key(data);
		this.draw_block(data);
		this.draw_state_text(data);
	}

	reset_static() {
		this.static_drawn = false;
		this.anim_initialized = false;
		this.anim_progress = 0;
	}

	private camera_x = 0;
	private camera_y = 0;

	private anim_x(): number {
		return this.anim_from_x + (this.anim_target_x - this.anim_from_x) * this.anim_progress;
	}

	private anim_y(): number {
		return this.anim_from_y + (this.anim_target_y - this.anim_from_y) * this.anim_progress;
	}

	private to_screen_x(val: number) {
		return (val - this.camera_x) * CELL_SIZE + CANVAS_W / 2;
	}

	private to_screen_y(val: number) {
		return (this.camera_y - val) * CELL_SIZE + CANVAS_H / 2;
	}

	private draw_grounds(data: ViewData) {
		this.grounds_container.removeChildren();
		const stroke_width = 1;
		const offset = stroke_width / 2;
		const r = CELL_SIZE / 2;
		for (const g of data.grounds) {
			const graphic = new Graphics()
				.rect(-r + offset, -r + offset, CELL_SIZE - offset * 2, CELL_SIZE - offset * 2)
				.fill({ color: 0xd9d9d9 })
				.stroke({ width: stroke_width, color: 0xeeeeee });
			graphic.x = this.to_screen_x(g.position.x);
			graphic.y = this.to_screen_y(g.position.y);

			this.grounds_container.addChild(graphic);

			const text = (v => {
				if (v === 0) return "";
				else if (v > 0) return `+${v}`;
				else return `${v}`;
			})(g.kinetic_energy_delta);

			const delta_text = new Text({ text });

			delta_text.alpha = 0.5;
			delta_text.anchor.set(0.5, 0.5);
			delta_text.x = this.to_screen_x(g.position.x);
			delta_text.y = this.to_screen_y(g.position.y);

			this.grounds_container.addChild(delta_text);
		}
	}

	private draw_end_zone(data: ViewData) {
		this.end_zones_container.removeChildren();
		const graphic = new Graphics()
			.rect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE)
			.fill({ color: 0x00ff00, alpha: 0.5 });
		graphic.x = this.to_screen_x(data.end_zone.position.x);
		graphic.y = this.to_screen_y(data.end_zone.position.y);
		this.end_zones_container.addChild(graphic);
	}

	private draw_static_blocks(data: ViewData) {
		this.static_blocks_container.removeChildren();
		const stroke_width = 1;
		const offset = stroke_width / 2;
		const r = CELL_SIZE / 2;
		for (const s of data.static_blocks) {
			const graphic = new Graphics()
				.rect(-r + offset, -r + offset, CELL_SIZE - offset * 2, CELL_SIZE - offset * 2)
				.fill({ color: 0x000, alpha: 0.1 })
				.stroke({ width: stroke_width, color: 0x000 });
			graphic.x = this.to_screen_x(s.position.x);
			graphic.y = this.to_screen_y(s.position.y);
			this.static_blocks_container.addChild(graphic);

			const text = (v => {
				if (v.top === v.right && v.right === v.bottom && v.bottom === v.left) {
					if (v.top === 0) return "";
					else return `${v.top}`;
				}
				return "?"; // todo
			})(s.cor);

			const delta_text = new Text({ text });

			delta_text.alpha = 0.5;
			delta_text.anchor.set(0.5, 0.5);
			delta_text.x = this.to_screen_x(s.position.x);
			delta_text.y = this.to_screen_y(s.position.y);

			this.static_blocks_container.addChild(delta_text);
		}
	}

	private draw_block(data: ViewData) {
		this.block_graphics.clear();
		this.block_graphics.rect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
		this.block_graphics.fill({ color: 0x0000ff, alpha: 0.5 });

		const stroke_width = 8;

		const edge_len = CELL_SIZE / 2;
		const inset = CELL_SIZE / 2 - stroke_width / 2;
		switch (data.block.facing_dir) {
			case Direction.Up:
				this.block_graphics.moveTo(-edge_len, -inset);
				this.block_graphics.lineTo(edge_len, -inset);
				break;
			case Direction.Right:
				this.block_graphics.moveTo(inset, -edge_len);
				this.block_graphics.lineTo(inset, edge_len);
				break;
			case Direction.Down:
				this.block_graphics.moveTo(-edge_len, inset);
				this.block_graphics.lineTo(edge_len, inset);
				break;
			case Direction.Left:
				this.block_graphics.moveTo(-inset, -edge_len);
				this.block_graphics.lineTo(-inset, edge_len);
				break;
		}
		this.block_graphics.stroke({ width: stroke_width, color: 0x0000ff });

		const raw_x = this.to_screen_x(this.anim_x());
		const raw_y = this.to_screen_y(this.anim_y());
		if (this.anim_progress >= 0.85) {
			this.block_graphics.x = this.to_screen_x(data.block.position.x);
			this.block_graphics.y = this.to_screen_y(data.block.position.y);
		} else {
			this.block_graphics.x = raw_x;
			this.block_graphics.y = raw_y;
		}

		if (data.transition_progress > 0) {
			const p = data.transition_progress;
			this.block_graphics.alpha = 1 - p;
			this.block_graphics.scale.set(1 - p * 0.7);
			this.block_graphics.visible = true;
		} else if (data.fall_progress > 0) {
			const t = data.fall_progress * 1.2;
			const drift = t * 120;
			const drop = 9.8 * t * t * 0.5;
			const p = data.fall_progress;
			const scale = 1 - p * p * 0.85;
			this.block_graphics.x += data.fall_dir_x * drift;
			this.block_graphics.y += -data.fall_dir_y * drift + drop;
			this.block_graphics.scale.set(scale);
			this.block_graphics.visible = true;
		} else if (data.die_progress > 0) {
			const t = data.die_progress * 0.8;
			const alpha = Math.sin(t * 12 * Math.PI) * 0.5 + 0.5;
			this.block_graphics.visible = alpha > 0.3;
		} else {
			this.block_graphics.visible = true;
			this.block_graphics.alpha = 1;

			const bp = data.bounce_progress;
			if (bp > 0) {
				const squash = 1 - bp * 0.3;
				const stretch = 1 + bp * 0.15;
				const is_vertical = data.bounce_dir === Direction.Up || data.bounce_dir === Direction.Down;
				this.block_graphics.scale.set(is_vertical ? stretch : squash, is_vertical ? squash : stretch);
			} else {
				this.block_graphics.scale.set(1);
			}
		}
	}

	private draw_key(data: ViewData) {
		this.keys_container.removeChildren();
		if (data.is_key_visible) {
			const graphic = new Graphics().circle(0, 0, CELL_SIZE / 4).fill({ color: 0x00ff00, alpha: 0.5 });
			graphic.x = this.to_screen_x(data.key.position.x);
			graphic.y = this.to_screen_y(data.key.position.y);
			this.keys_container.addChild(graphic);
		}
	}

	private draw_state_text(data: ViewData) {
		this.state_text.text = `\
target: ${data.target_ke}
current: ${data.current_ke}\
`;
	}
}
