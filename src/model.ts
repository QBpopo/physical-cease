import { Direction, Cor, opposite_dir, Position } from "./components.ts";
import { Block, Ground, StaticBlock, Key, EndZone } from "./entities.ts";
import type { DataFields } from "./types.ts";

export const enum ModelState {
	Playing,
	Won,
	Lost,
}

const dir_offset = (dir: Direction): [number, number] => {
	switch (dir) {
		case Direction.Up:
			return [0, 1];
		case Direction.Right:
			return [1, 0];
		case Direction.Down:
			return [0, -1];
		case Direction.Left:
			return [-1, 0];
	}
};

const cor_at = (cor: Cor, dir: Direction): number => {
	switch (dir) {
		case Direction.Up:
			return cor.top;
		case Direction.Right:
			return cor.right;
		case Direction.Down:
			return cor.bottom;
		case Direction.Left:
			return cor.left;
	}
};

const num_to_dir = (n: number): Direction => {
	if (n === 0) return Direction.Up;
	if (n === 1) return Direction.Right;
	if (n === 2) return Direction.Down;
	return Direction.Left;
};

export class Model {
	target_kinetic_energy = 0;

	block = new Block();
	grounds: Ground[] = [];
	static_blocks: StaticBlock[] = [];
	key = new Key();
	end_zone = new EndZone();

	has_key = false;
	status = ModelState.Playing;

	private readonly initial_block: DataFields<Block>;

	constructor(model: DataFields<Model>) {
		this.target_kinetic_energy = model.target_kinetic_energy;
		this.block = model.block;
		this.grounds = model.grounds;
		this.static_blocks = model.static_blocks;
		this.key = model.key;
		this.end_zone = model.end_zone;

		this.initial_block = structuredClone(model.block);
	}

	private can_action() {
		if (this.status !== ModelState.Playing) return false;
		if (this.block.current_kinetic_energy > 0) return false;
		return true;
	}

	private check_end_condition() {
		const is_at_end_zone = this.end_zone.position.eq(this.block.position);
		if (is_at_end_zone && this.has_key) {
			this.status = ModelState.Won;
		}
	}

	turn() {
		if (!this.can_action()) return;
		this.block.facing_dir = (this.block.facing_dir + 1) % 4;
	}

	gain_ke() {
		if (!this.can_action()) return;
		this.block.current_kinetic_energy = this.target_kinetic_energy;
		this.block.velocity_dir = this.block.facing_dir;
	}

	reset_level() {
		this.block = new Block(structuredClone(this.initial_block));
		this.has_key = false;
		this.status = ModelState.Playing;
	}

	step() {
		if (this.status !== ModelState.Playing) return;
		if (this.block.current_kinetic_energy === 0) {
			this.check_end_condition();
			return;
		}

		if (this.key.position.eq(this.block.position)) {
			this.has_key = true;
		}

		const offset = dir_offset(this.block.velocity_dir);
		const next_pos = new Position({
			x: this.block.position.x + offset[0],
			y: this.block.position.y + offset[1],
		});

		const wall = this.static_blocks.find(w => w.position.eq(next_pos));
		if (wall) {
			const relative_collision_dir = num_to_dir((this.block.velocity_dir - this.block.facing_dir + 4) % 4);
			const next_velocity_dir = opposite_dir(this.block.velocity_dir);

			const e_block = cor_at(this.block.cor, relative_collision_dir);
			const e_wall = cor_at(wall.cor, next_velocity_dir);

			this.block.current_kinetic_energy *= e_block * e_wall;
			this.block.velocity_dir = next_velocity_dir;

			this.check_end_condition();
			return;
		}

		// 面朝方向那一侧扫过的格子才触发地面效果
		const swept_pos = this.block.facing_dir === this.block.velocity_dir ? next_pos : this.block.position;

		this.block.position = next_pos;

		const ground = this.grounds.find(g => g.position.eq(swept_pos));
		if (!ground) {
			this.status = ModelState.Lost;
			this.reset_level();
			return;
		}

		this.block.current_kinetic_energy += ground.kinetic_energy_delta;

		if (this.block.current_kinetic_energy < 0) {
			this.status = ModelState.Lost;
			this.reset_level();
			return;
		}
	}
}
