import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoom } from '../../../../../app/utils/roomStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { playerName } = body;

    if (!playerName) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const room = getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.playerRoles) {
      return NextResponse.json(
        { error: 'Game has not started yet' },
        { status: 400 }
      );
    }

    // Find and update the player's confirmation status
    const updatedRoles = room.playerRoles.map(pr =>
      pr.playerName === playerName
        ? { ...pr, hasConfirmed: true }
        : pr
    );

    // Check if all players have confirmed
    const allConfirmed = updatedRoles.every(pr => pr.hasConfirmed);

    // Update room
    const updates: any = { playerRoles: updatedRoles };

    // If all players confirmed, move to timer phase
    if (allConfirmed) {
      updates.gamePhase = 'timer';
      updates.gameStartTime = Date.now();
    }

    const success = updateRoom(roomId, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to confirm role' },
        { status: 500 }
      );
    }

    const updatedRoom = getRoom(roomId);
    return NextResponse.json({
      success: true,
      allConfirmed,
      gamePhase: updatedRoom?.gamePhase,
    });
  } catch (error) {
    console.error('Error confirming role:', error);
    return NextResponse.json(
      { error: 'Failed to confirm role' },
      { status: 500 }
    );
  }
}
