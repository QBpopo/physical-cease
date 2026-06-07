import { Cor, Position } from "../components.ts";
import { Block, Ground, StaticBlock, Key, EndZone } from "../entities.ts";

import { Model, ModelState } from "../model.ts";

const grounds: Ground[] = Array.from({ length: 8 }, (_, i) => i + 1).flatMap(x =>
	Array.from({ length: 7 }, (_, i) => i + 1).map(
		y => new Ground({ position: Position.from([x, y]), kinetic_energy_delta: 0 }),
	),
);

const static_blocks: StaticBlock[] = [
	new StaticBlock({ position: Position.from([2, 7]), cor: Cor.from(0) }),
	new StaticBlock({ position: Position.from([7, 3]), cor: Cor.from(0) }),
	new StaticBlock({ position: Position.from([8, 6]), cor: Cor.from(0) }),
];

export const tutorial = new Model({
	target_kinetic_energy: 2,
	block: { ...new Block(), position: Position.from([2, 4]) },
	grounds,
	static_blocks,
	key: new Key({ position: Position.from([7, 4]) }),
	end_zone: new EndZone({ position: Position.from([7, 4]) }),
	has_key: false,
	status: ModelState.Playing,
});
