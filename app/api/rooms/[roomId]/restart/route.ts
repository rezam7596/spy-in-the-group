import {NextRequest, NextResponse} from 'next/server';
import {getRoom, updateRoom} from '../../../../../app/utils/roomStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  // Get player session from request body
  const body = await request.json();
  const {playerId} = body;

  if (!playerId) {
    return NextResponse.json({error: 'Player ID required'}, {status: 400});
  }

  const room = getRoom(roomId);

  if (!room) {
    return NextResponse.json({error: 'Room not found'}, {status: 404});
  }

  // Verify the caller is the host
  if (room.hostId !== playerId) {
    return NextResponse.json({error: 'Only host can restart the game'}, {status: 403});
  }

  // Reset room to waiting state with new game
  const success = updateRoom(roomId, {
    status: 'waiting',
    gamePhase: 'waiting',
    location: null,
    playerRoles: undefined,
    votes: undefined,
    gameStartTime: null,
  });

  if (!success) {
    return NextResponse.json({error: 'Failed to restart room'}, {status: 500});
  }

  // Get the updated room object
  const updatedRoom = getRoom(roomId);

  return NextResponse.json({
    success: true,
    room: updatedRoom,
  });
}
