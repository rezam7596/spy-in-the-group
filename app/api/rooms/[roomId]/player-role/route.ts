import { NextRequest, NextResponse } from 'next/server';
import { getRoom } from '../../../../../app/utils/roomStore';

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

    const room = await getRoom(roomId);

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

    // Find the player's role
    const playerRole = room.playerRoles.find(pr => pr.playerName === playerName);

    if (!playerRole) {
      return NextResponse.json(
        { error: 'Player not found in this game' },
        { status: 404 }
      );
    }

    // Return player's role information
    return NextResponse.json({
      playerName: playerRole.playerName,
      isSpy: playerRole.isSpy,
      role: playerRole.role,
      location: playerRole.isSpy ? null : room.location,
      hasConfirmed: playerRole.hasConfirmed,
      gamePhase: room.gamePhase,
    });
  } catch (error) {
    console.error('Error getting player role:', error);
    return NextResponse.json(
      { error: 'Failed to get player role' },
      { status: 500 }
    );
  }
}
