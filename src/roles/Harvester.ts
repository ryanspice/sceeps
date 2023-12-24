// roles/harvester.ts
export class Harvester {
	private creep: Creep;
	private actionCooldown: number = 10; // ticks to commit to an action before reconsidering

	constructor(creep: Creep) {
		this.creep = creep;
	}

	public run() {
		// Switch tasks if necessary
		if (this.creep.memory.working && this.creep.store[RESOURCE_ENERGY] == 0) {
			this.creep.memory.working = false;
			this.creep.say('🔄 harvest');
		}
		if (!this.creep.memory.working && this.creep.store.getFreeCapacity() == 0) {
			// this.decideNextTask();
		}

		// Execute the current task
		if (!this.creep.memory.working) {
			this.harvestEnergy();
		} else {
			if (this.creep.memory.upgrading) {
				this.upgradeController();
			} else if (this.creep.memory.repairing) {
				// this.repairStructures();
			} else {
				this.deliverEnergy();
			}
			// Move away from the source if not mining and too close
			this.moveAwayFromSource();
		}
	}

	private decideNextTask() {
		// Logic to decide whether to upgrade or repair
		const shouldUpgrade = Math.random() < 0.005; // 50% chance to upgrade, adjust as needed

		if (shouldUpgrade) {
			this.creep.memory.upgrading = true;
			this.creep.memory.repairing = false;
			this.creep.say('⚡ upgrade');
		} else {
			this.creep.memory.repairing = true;
			this.creep.memory.upgrading = false;
			this.creep.say('🔧 repair');
		}

		this.creep.memory.working = true;
		this.creep.memory.actionStartTick = Game.time;
	}

	private harvestEnergy() {
		const source = this.findBestSource();
		if (source && this.creep.harvest(source) === ERR_NOT_IN_RANGE) {
			this.creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
		}
	}

	private upgradeController() {
		// Check if the creep has been working for the set cooldown period
		if (Game.time - (this.creep.memory.actionStartTick || 0) > this.actionCooldown) {
			this.decideNextTask(); // Decide the next task if the action cooldown has passed
			return; // Exit the function to prevent further actions this tick
		}

		// Ensure the creep is meant to be upgrading and that a controller exists
		if (this.creep.memory.upgrading && this.creep.room.controller) {
			// Attempt to upgrade the controller
			const upgradeResult = this.creep.upgradeController(this.creep.room.controller);

			// If the creep is not in range of the controller, move towards it
			if (upgradeResult === ERR_NOT_IN_RANGE) {
				this.creep.moveTo(this.creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
			} else if (upgradeResult === OK) {
				// If the upgrade was successful, optionally perform any additional logic
				// For example, you might track the amount of energy used for upgrading
			} else {
				// If there was an error other than being out of range, log it for further investigation
				console.log(`Harvester couldn't upgrade: ${upgradeResult}`);
			}
		}
	}

	private moveAwayFromSource() {
		if (this.isNearSource() && !this.creep.memory.harvesting) {
			const fleePath = PathFinder.search(this.creep.pos, { pos: this.creep.pos.findClosestByRange(FIND_SOURCES)!.pos, range: 3 }, { flee: true });
			this.creep.moveByPath(fleePath.path);
			this.creep.say('🚶 away');
		}
	}

	private isNearSource(): boolean {
		const source = this.creep.pos.findClosestByRange(FIND_SOURCES);
		return this.creep.pos.inRangeTo(source!, 2); // Checks if the creep is within 2 tiles of the source
	}

	private repairStructures() {
		if (Game.time - (this.creep.memory.actionStartTick || 0) > this.actionCooldown) {
			this.decideNextTask();
			return;
		}

		const targets = this.creep.room.find(FIND_STRUCTURES, {
			filter: object => object.hits < object.hitsMax,
		});

		targets.sort((a, b) => a.hits - b.hits);

		if (targets.length > 0) {
			if (this.creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
				this.creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
			}
		} else {
			this.decideNextTask(); // No targets to repair, decide next task
		}
	}

	private deliverEnergy() {
		const target = this.findEnergyDeliveryTarget();
		if (target && this.creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
			this.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
		}
	}

	private findBestSource(): Source | null {
		// Find all sources
		const sources = this.creep.room.find(FIND_SOURCES_ACTIVE);

		// Calculate path to each source and return the one with the shortest path
		let closestSource = null;
		let shortestPathLength = Infinity;

		for (const source of sources) {
			const path = this.creep.pos.findPathTo(source);
			if (path.length < shortestPathLength) {
				shortestPathLength = path.length;
				closestSource = source;
			}
		}

		return closestSource;
	}

	private findEnergyDeliveryTarget(): Structure | null {
		// List of structure types to deliver energy to, in priority order
		const structurePriorities = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER];

		for (const structureType of structurePriorities) {
			const targets = this.creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return structure.structureType === structureType &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});

			if (targets.length > 0) {
				// Return the closest target of the highest priority type
				return this.creep.pos.findClosestByPath(targets);
			}
		}

		// If no priority targets need energy, consider other structures
		const otherTargets = this.creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType === STRUCTURE_CONTAINER ||
					structure.structureType === STRUCTURE_STORAGE) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});

		return this.creep.pos.findClosestByPath(otherTargets);
	}

}
