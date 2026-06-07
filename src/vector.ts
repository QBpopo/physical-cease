import type { DataFields } from "./types.ts";
import type { FnFrom, ImplFrom } from "./trait/from.ts";
import { use_trait_from } from "./trait/from.ts";

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
