import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoom } from '../../../../app/utils/roomStore';

export async function GET(
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

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const success = await updateRoom(roomId, { status });

    if (!success) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const room = await getRoom(roomId);
    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}
