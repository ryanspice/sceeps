// managers/CreepManager.ts
import { Harvester } from "../roles/Harvester";
import { HarvesterProbe } from "../roles/HarvesterProbe";
export class CreepManager {

	public run() {
		for (const name in Game.creeps) {
			const creep = Game.creeps[name];

			// if (creep.memory.role === 'harvester') {
			// 	const harvester = new Harvester(creep);
			// 	harvester.run();
			// }

			if (creep.memory.role === 'harvesterProbe') {
				const harvesterProbe = new HarvesterProbe(creep);
				harvesterProbe.run();
			}



			// Add other role checks and corresponding handlers here
		}
	}

	private handleHarvester(creep: Creep) {
		if (creep.store.getFreeCapacity() > 0) {
			const sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
			}
		} else {
			if (creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(Game.spawns['Spawn1'], { visualizePathStyle: { stroke: '#ffffff' } });
			}
		}
	}
}
