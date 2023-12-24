// managers/SpawnManager.ts
export class SpawnManager {
	public run() {
		for (const spawnName in Game.spawns) {
			const spawn = Game.spawns[spawnName];

			if (!spawn.spawning && this.shouldSpawnHarvester(spawn)) {
				const newName = 'Harvester' + Game.time;
				const spawnResult = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
					memory: { role: 'harvester', working: false, room: spawn.room.name },
				});

				if (spawnResult === OK) {
					console.log(`${newName} (SCV) ready in room ${spawn.room.name}`);
				}
			}
		}
	}
	private spawnHarvesterProbe() {
		const name = 'HarvesterProbe' + Game.time;
		const body = [MOVE, MOVE, MOVE, MOVE, CARRY, WORK]; // Fast with light carry weight and the ability to build
		const memory = { role: 'harvesterProbe', working: false };

		return Game.spawns['Spawn1'].spawnCreep(body, name, { memory });
	}

	private shouldSpawnHarvester(spawn: StructureSpawn): boolean {
		const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.room.name === spawn.room.name);
		return harvesters.length < 2;
	}
}
