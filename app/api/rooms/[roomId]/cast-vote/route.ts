import { NextRequest, NextResponse } from 'next/server';
import { getRoom, castVote, updateGamePhase } from '../../../../../app/utils/roomStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { voterName, votedForName } = body;

    if (!voterName || !votedForName) {
      return NextResponse.json(
        { error: 'Voter name and voted for name are required' },
        { status: 400 }
      );
    }

    const success = await castVote(roomId, voterName, votedForName);

    if (!success) {
      return NextResponse.json(
        { error: 'Room not found or not in voting phase' },
        { status: 404 }
      );
    }

    // Check if all players have voted
    const room = await getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const allVoted = room.players.every(playerName =>
      room.votes?.some(v => v.voterName === playerName)
    );

    // If all voted, update phase
    if (allVoted) {
      await updateGamePhase(roomId, 'results', { status: 'finished' });
    }

    return NextResponse.json({
      success: true,
      allVoted,
      gamePhase: allVoted ? 'results' : 'voting',
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    );
  }
}
