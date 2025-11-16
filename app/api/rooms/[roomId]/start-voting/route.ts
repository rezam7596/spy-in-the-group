import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoom } from '../../../../../app/utils/roomStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = await getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (room.gamePhase !== 'timer') {
      return NextResponse.json(
        { error: 'Game is not in timer phase' },
        { status: 400 }
      );
    }

    // Transition to voting phase
    const success = await updateRoom(roomId, {
      gamePhase: 'voting',
      votes: [], // Initialize empty votes array
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to start voting' },
        { status: 500 }
      );
    }

    const updatedRoom = await getRoom(roomId);
    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error starting voting:', error);
    return NextResponse.json(
      { error: 'Failed to start voting' },
      { status: 500 }
    );
  }
}
