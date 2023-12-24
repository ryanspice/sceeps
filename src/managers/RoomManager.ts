// managers/RoomManager.ts
export class RoomManager {
	public run() {
		for (const name in Game.rooms) {
			const room = Game.rooms[name];
			console.log(`Room ${name} has ${room.energyAvailable} energy`);
		}
	}
}
