import { Room } from '../types/game';

// In-memory room storage (would be Redis/DB in production)
const rooms = new Map<string, Room>();

// Clean up old rooms (older than 2 hours)
setInterval(() => {
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;

  for (const [id, room] of rooms.entries()) {
    if (now - room.createdAt > twoHours) {
      rooms.delete(id);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function createRoom(room: Room): void {
  rooms.set(room.id, room);
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function updateRoom(id: string, updates: Partial<Room>): boolean {
  const room = rooms.get(id);
  if (!room) return false;

  rooms.set(id, { ...room, ...updates });
  return true;
}

export function addPlayerToRoom(roomId: string, playerName: string): boolean {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'waiting') return false;

  if (!room.players.includes(playerName)) {
    room.players.push(playerName);
    rooms.set(roomId, room);
  }

  return true;
}

export function removePlayerFromRoom(roomId: string, playerName: string): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;

  room.players = room.players.filter(p => p !== playerName);
  rooms.set(roomId, room);

  return true;
}

export function deleteRoom(id: string): boolean {
  return rooms.delete(id);
}
