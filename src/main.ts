// main.ts
import { ErrorMapper } from "utils/ErrorMapper";
import { CreepManager } from "managers/CreepManager";
import { SpawnManager } from "managers/SpawnManager";
import { TowerManager } from "managers/TowerManager";
import { RoomManager } from "managers/RoomManager";

declare global {
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    target?: string;
    sourceId?: string;
    upgrading?: boolean;     // Indicates if the creep is currently upgrading a controller
    harvesting?: boolean;     // Indicates if the creep is currently repairing a structure
    repairing?: boolean;     // Indicates if the creep is currently repairing a structure
    actionStartTick?: number; // The game tick when the creep started its current action
  }

  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

const creepManager = new CreepManager();
const spawnManager = new SpawnManager();
const towerManager = new TowerManager();
const roomManager = new RoomManager();

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  cleanCreepsMemory();

  roomManager.run();
  creepManager.run();
  spawnManager.run();
  towerManager.run();
});

function cleanCreepsMemory() {
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      console.log(`Clearing non-existing creep memory: ${name}`);
      delete Memory.creeps[name];
    }
  }
}
