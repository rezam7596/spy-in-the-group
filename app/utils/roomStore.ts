import {Room} from '../types/game';
import {connectToDatabase} from './mongodb';

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(room: Room): Promise<void> {
  const db = await connectToDatabase();
  await db.collection('rooms').insertOne(room);
}

export async function getRoom(id: string): Promise<Room | null> {
  const db = await connectToDatabase();
  const room = await db.collection('rooms').findOne({id});
  return room as Room | null;
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<boolean> {
  const db = await connectToDatabase();
  const result = await db.collection('rooms').updateOne(
    {id},
    {$set: updates}
  );
  return result.matchedCount > 0;
}

export async function addPlayerToRoom(roomId: string, playerName: string): Promise<boolean> {
  const db = await connectToDatabase();

  // First check if room exists and is in waiting status
  const room = await getRoom(roomId);
  if (!room || room.status !== 'waiting') {
    return false;
  }

  // Add player if not already in the list
  const result = await db.collection('rooms').updateOne(
    {id: roomId, players: {$ne: playerName}},
    {$push: {players: playerName} as any}
  );

  return result.modifiedCount > 0 || room.players.includes(playerName);
}

export async function removePlayerFromRoom(roomId: string, playerName: string): Promise<boolean> {
  const db = await connectToDatabase();
  const result = await db.collection('rooms').updateOne(
    {id: roomId},
    {$pull: {players: playerName} as any}
  );
  return result.modifiedCount > 0;
}

export async function deleteRoom(id: string): Promise<boolean> {
  const db = await connectToDatabase();
  const result = await db.collection('rooms').deleteOne({id});
  return result.deletedCount > 0;
}
