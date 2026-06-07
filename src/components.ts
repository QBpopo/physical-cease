import type { DataFields } from "./types.ts";

import type { FnFrom, ImplFrom } from "./trait/from.ts";
import { use_trait_from } from "./trait/from.ts";

export const enum Direction {
	Up,
	Right,
	Down,
	Left,
}

export const next_dir = (dir: Direction): Direction => (dir + 1) % 4;
export const opposite_dir = (dir: Direction): Direction => (dir + 2) % 4;
export const prev_dir = (dir: Direction): Direction => (dir + 3) % 4;

// 恢复系数 e (Coefficient of Restitution)
export class Cor {
	top = 1;
	right = 1;
	bottom = 1;
	left = 1;

	constructor(cor?: DataFields<Cor>) {
		if (!cor) return;
		this.top = cor.top;
		this.right = cor.right;
		this.bottom = cor.bottom;
		this.left = cor.left;
	}

	declare static impl_From: ImplFrom;
	declare static from: FnFrom<Cor>;
}
use_trait_from(Cor);
Cor.impl_From(Number, v => new Cor({ top: v, right: v, bottom: v, left: v }));

export class Vector {
	x: number = 0;
	y: number = 0;

	constructor(vec?: DataFields<Vector>) {
		if (!vec) return;
		this.x = vec.x;
		this.y = vec.y;
	}

	eq(other: this): boolean {
		return this.x === other.x && this.y === other.y;
	}
}

export class Position extends Vector {
	declare static impl_From: ImplFrom;
	declare static from: FnFrom<Position>;
}
use_trait_from(Position);
Position.impl_From(Array, (v: [number, number]) => new Position({ x: v[0], y: v[1] }));

export class Velocity extends Vector {
	declare static impl_From: ImplFrom;
	declare static from: FnFrom<Velocity>;
}
use_trait_from(Velocity);
Velocity.impl_From(Array, (v: [number, number]) => new Velocity({ x: v[0], y: v[1] }));
