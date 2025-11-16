import { NextRequest, NextResponse } from 'next/server';
import { createRoom, generateRoomId } from '../../../utils/roomStore';
import { Room } from '../../../types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId, hostName, settings } = body;

    if (!hostId || !hostName || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const roomId = generateRoomId();
    const room: Room = {
      id: roomId,
      hostId,
      players: [hostName], // Host is the first player
      settings,
      status: 'waiting',
      createdAt: Date.now(),
    };

    createRoom(room);

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
