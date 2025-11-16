import { NextRequest, NextResponse } from 'next/server';
import { addPlayerToRoom, getRoom } from '../../../../../app/utils/roomStore';

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

    const success = addPlayerToRoom(roomId, playerName);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to join room' },
        { status: 400 }
      );
    }

    const room = getRoom(roomId);
    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
