// roles/HarvesterProbe.ts
export class HarvesterProbe {
	private creep: Creep;

	constructor(creep: Creep) {
		this.creep = creep;
	}

	public run() {
		if (this.creep.memory.working && this.creep.store.getFreeCapacity() === 0) {
			this.creep.memory.working = false;
			this.creep.say('🚧 build');
		} else if (!this.creep.memory.working && this.creep.store[RESOURCE_ENERGY] === 0) {
			this.creep.memory.working = true;
			this.creep.say('⛏️ harvest');
		}

		if (this.creep.memory.working) {
			this.harvestEnergy();
		} else {
			if (this.buildStructure()) {
				// If successfully started building, continue
				return;
			} else {
				// If nothing to build, act as a normal energy deliverer
				this.deliverEnergy();
			}
		}
	}

	private harvestEnergy() {
		const source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
		if (source && this.creep.harvest(source) === ERR_NOT_IN_RANGE) {
			this.creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
		}
	}

	private deliverEnergy() {
		const target = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType === STRUCTURE_SPAWN ||
					structure.structureType === STRUCTURE_EXTENSION ||
					structure.structureType === STRUCTURE_TOWER) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});

		if (target) {
			if (this.creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
			}
		}
	}

	private buildStructure() {
		const constructionSite = this.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
		if (constructionSite) {
			if (this.creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
				this.creep.moveTo(constructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
			}
			return true;
		}
		return false;
	}
}
