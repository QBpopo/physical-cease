import { Cor, Position } from "../components.ts";
import { Block, Ground, StaticBlock, Key, EndZone } from "../entities.ts";

import { Model, ModelState } from "../model.ts";

const grounds = Array.from({ length: 8 }, (_, i) => i + 1).flatMap(x =>
	Array.from({ length: 7 }, (_, i) => i + 1).map(
		y => new Ground({ position: Position.from([x, y]), kinetic_energy_delta: 0 }),
	),
);

const index = (x: number, y: number): number => (x - 1) * 7 + (y - 1);

grounds[index(2, 2)]!.kinetic_energy_delta = -2;
grounds[index(2, 4)]!.kinetic_energy_delta = -1;
grounds[index(3, 4)]!.kinetic_energy_delta = -1;
grounds[index(3, 6)]!.kinetic_energy_delta = -1;
grounds[index(4, 6)]!.kinetic_energy_delta = -1;
grounds[index(6, 2)]!.kinetic_energy_delta = -2;
grounds[index(6, 4)]!.kinetic_energy_delta = -1;
grounds[index(6, 7)]!.kinetic_energy_delta = -1;
grounds[index(7, 4)]!.kinetic_energy_delta = -1;
grounds[index(7, 6)]!.kinetic_energy_delta = -1;
grounds[index(8, 2)]!.kinetic_energy_delta = -1;
grounds[index(8, 7)]!.kinetic_energy_delta = -3;

const static_blocks: StaticBlock[] = [
	new StaticBlock({ position: Position.from([2, 7]), cor: Cor.from(0) }),
	new StaticBlock({ position: Position.from([7, 3]), cor: Cor.from(0) }),
];

export const friction_energy = new Model({
	target_kinetic_energy: 3,
	block: { ...new Block(), position: Position.from([2, 4]) },
	grounds,
	static_blocks,
	key: new Key({ position: Position.from([2, 3]) }),
	end_zone: new EndZone({ position: Position.from([7, 4]) }),
	has_key: false,
	status: ModelState.Playing,
});
