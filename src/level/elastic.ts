import { Cor, Position } from "../components.ts";
import { Block, Ground, StaticBlock, Key, EndZone } from "../entities.ts";

import { Model, ModelState } from "../model.ts";

const grounds = Array.from({ length: 8 }, (_, i) => i + 1).flatMap(x =>
	Array.from({ length: 7 }, (_, i) => i + 1).map(
		y => new Ground({ position: Position.from([x, y]), kinetic_energy_delta: 0 }),
	),
);

const index = (x: number, y: number): number => (x - 1) * 7 + (y - 1);

grounds[index(5, 4)]!.kinetic_energy_delta = -1;
grounds[index(6, 5)]!.kinetic_energy_delta = -1;

const static_blocks: StaticBlock[] = [
	new StaticBlock({ position: Position.from([1, 5]), cor: Cor.from(1) }),
	new StaticBlock({ position: Position.from([5, 1]), cor: Cor.from(0.5) }),
	new StaticBlock({ position: Position.from([8, 5]), cor: Cor.from(1) }),
];

export const elastic = new Model({
	target_kinetic_energy: 3,
	block: { ...new Block(), position: Position.from([5, 7]) },
	grounds,
	static_blocks,
	key: new Key({ position: Position.from([3, 5]) }),
	end_zone: new EndZone({ position: Position.from([5, 5]) }),
	has_key: false,
	status: ModelState.Playing,
});
