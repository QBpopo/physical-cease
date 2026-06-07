import type { DataFields } from "./types.ts";
import { Direction, Cor, Position } from "./components.ts";

export class Block {
	position = new Position();
	cor = new Cor();
	facing_dir = Direction.Up;
	velocity_dir = this.facing_dir;
	current_kinetic_energy = 0;

	constructor(block?: DataFields<Block>) {
		if (!block) return;
		this.position = block.position;
		this.cor = block.cor;
		this.facing_dir = block.facing_dir;
		this.velocity_dir = block.velocity_dir;
		this.current_kinetic_energy = block.current_kinetic_energy;
	}
}

export class Ground {
	position = new Position();
	kinetic_energy_delta = 0;

	constructor(ground?: DataFields<Ground>) {
		if (!ground) return;
		this.position = ground.position;
		this.kinetic_energy_delta = ground.kinetic_energy_delta;
	}
}

export class StaticBlock {
	position = new Position();
	cor = Cor.from(0);

	constructor(static_block?: DataFields<StaticBlock>) {
		if (!static_block) return;
		this.position = static_block.position;
		this.cor = static_block.cor;
	}
}

export class Key {
	position = new Position();
	constructor(key?: DataFields<Key>) {
		if (!key) return;
		this.position = key.position;
	}
}

export class EndZone {
	position = new Position();
	constructor(end_zone?: DataFields<EndZone>) {
		if (!end_zone) return;
		this.position = end_zone.position;
	}
}
