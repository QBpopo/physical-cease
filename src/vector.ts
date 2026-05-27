import type { DataFields } from "./types.ts";

export class Vector {
	x: number = 0;
	y: number = 0;

	constructor(vec?: DataFields<Vector>) {
		if (!vec) return;
		this.x = vec.x;
		this.y = vec.y;
	}
}

export class Position extends Vector {}

export class Velocity extends Vector {}
