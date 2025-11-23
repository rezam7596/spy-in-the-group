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

  // Atomically add player only if room is waiting and player not already in list
  const result = await db.collection('rooms').updateOne(
    {
      id: roomId,
      status: 'waiting',
      players: {$ne: playerName}
    },
    {$push: {players: playerName} as any}
  );

  // If no modification, check if player already exists
  if (result.modifiedCount === 0) {
    const room = await getRoom(roomId);
    return room?.players.includes(playerName) || false;
  }

  return true;
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

export async function castVote(
  roomId: string,
  voterName: string,
  votedForName: string
): Promise<boolean> {
  const db = await connectToDatabase();

  // Remove old vote atomically (if exists)
  await db.collection('rooms').updateOne(
    {id: roomId, gamePhase: 'voting'},
    {$pull: {votes: {voterName}} as any}
  );

  // Add new vote atomically
  const result = await db.collection('rooms').updateOne(
    {id: roomId, gamePhase: 'voting'},
    {$push: {votes: {voterName, votedForName}} as any}
  );

  return result.matchedCount > 0;
}

export async function confirmPlayerRole(
  roomId: string,
  playerName: string
): Promise<boolean> {
  const db = await connectToDatabase();

  const result = await db.collection('rooms').updateOne(
    {id: roomId, playerRoles: {$exists: true}},
    {$set: {'playerRoles.$[player].hasConfirmed': true}},
    {arrayFilters: [{'player.playerName': playerName}]}
  );

  return result.matchedCount > 0;
}

export async function updateGamePhase(
  roomId: string,
  gamePhase: string,
  additionalUpdates?: Record<string, any>
): Promise<boolean> {
  const db = await connectToDatabase();

  const result = await db.collection('rooms').updateOne(
    {id: roomId},
    {$set: {gamePhase, ...additionalUpdates}}
  );

  return result.matchedCount > 0;
}
