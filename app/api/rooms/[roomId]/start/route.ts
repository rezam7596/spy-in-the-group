import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoom } from '../../../../../app/utils/roomStore';
import { getRandomLocation } from '../../../../../app/data/locations';
import { PlayerRole } from '../../../../../app/types/game';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game already started' },
        { status: 400 }
      );
    }

    if (room.players.length < 3) {
      return NextResponse.json(
        { error: 'Minimum 3 players required' },
        { status: 400 }
      );
    }

    // Randomly select a spy
    const randomSpyIndex = Math.floor(Math.random() * room.players.length);
    const spyName = room.players[randomSpyIndex];

    // Select a random location
    const location = getRandomLocation();

    if (!location) {
      return NextResponse.json(
        { error: 'Failed to select location' },
        { status: 500 }
      );
    }

    // Assign roles to players
    const usedRoles: string[] = [];
    const playerRoles: PlayerRole[] = room.players.map((playerName, index) => {
      const isSpy = index === randomSpyIndex;
      let role: string | undefined;

      if (room.settings.includeRoles && !isSpy && location) {
        // Assign a unique role to non-spy players
        const availableRoles = location.roles.filter(r => !usedRoles.includes(r));
        if (availableRoles.length > 0) {
          role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
          usedRoles.push(role);
        } else {
          // If all roles are used, pick a random one
          role = location.roles[Math.floor(Math.random() * location.roles.length)];
        }
      }

      return {
        playerName,
        isSpy,
        role,
        hasConfirmed: false,
      };
    });

    // Update room with game data
    const success = updateRoom(roomId, {
      status: 'playing',
      gamePhase: 'revealing',
      location,
      playerRoles,
      gameStartTime: null, // Will be set when all players confirm
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to start game' },
        { status: 500 }
      );
    }

    const updatedRoom = getRoom(roomId);
    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}
