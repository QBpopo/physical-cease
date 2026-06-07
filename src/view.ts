import { Application, Graphics, Container, Text } from "pixi.js";
import { Direction } from "./components.ts";
import type { Block, EndZone, Ground, Key, StaticBlock } from "./entities.ts";

const CANVAS_W = 800;
const CANVAS_H = 600;
const CELL_SIZE = 64;

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
	}

	private camera_x = 0;
	private camera_y = 0;

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

		const stroke_width = 4;

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

		this.block_graphics.x = this.to_screen_x(data.block.position.x);
		this.block_graphics.y = this.to_screen_y(data.block.position.y);
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
