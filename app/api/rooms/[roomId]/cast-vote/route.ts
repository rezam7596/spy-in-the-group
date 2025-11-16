import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoom } from '../../../../../app/utils/roomStore';

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

    const room = await getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (room.gamePhase !== 'voting') {
      return NextResponse.json(
        { error: 'Game is not in voting phase' },
        { status: 400 }
      );
    }

    const votes = room.votes || [];

    // Check if player already voted
    const existingVoteIndex = votes.findIndex(v => v.voterName === voterName);

    if (existingVoteIndex >= 0) {
      // Update existing vote
      votes[existingVoteIndex].votedForName = votedForName;
    } else {
      // Add new vote
      votes.push({ voterName, votedForName });
    }

    // Check if all players have voted
    const allVoted = room.players.every(playerName =>
      votes.some(v => v.voterName === playerName)
    );

    const updates: any = { votes };

    // If all players voted, move to results phase
    if (allVoted) {
      updates.gamePhase = 'results';
      updates.status = 'finished';
    }

    const success = await updateRoom(roomId, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to cast vote' },
        { status: 500 }
      );
    }

    const updatedRoom = await getRoom(roomId);
    return NextResponse.json({
      success: true,
      allVoted,
      gamePhase: updatedRoom?.gamePhase,
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    );
  }
}
