import { NextRequest, NextResponse } from 'next/server';
import { getRoom, confirmPlayerRole, updateGamePhase } from '../../../../../app/utils/roomStore';

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

    const success = await confirmPlayerRole(roomId, playerName);

    if (!success) {
      return NextResponse.json(
        { error: 'Room not found or game not started' },
        { status: 404 }
      );
    }

    // Check if all players have confirmed
    const room = await getRoom(roomId);
    if (!room || !room.playerRoles) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const allConfirmed = room.playerRoles.every(pr => pr.hasConfirmed);

    // If all confirmed, update phase
    if (allConfirmed) {
      await updateGamePhase(roomId, 'timer', { gameStartTime: Date.now() });
    }

    return NextResponse.json({
      success: true,
      allConfirmed,
      gamePhase: allConfirmed ? 'timer' : room.gamePhase,
    });
  } catch (error) {
    console.error('Error confirming role:', error);
    return NextResponse.json(
      { error: 'Failed to confirm role' },
      { status: 500 }
    );
  }
}
