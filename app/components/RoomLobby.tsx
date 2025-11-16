'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useGame } from '../contexts/GameContext';
import { Language } from '../types/game';
import { savePlayerSession } from '../utils/playerSession';
import styles from './RoomLobby.module.css';

interface RoomLobbyProps {
  settings: {
    timerDuration: number;
    includeRoles: boolean;
    language: Language;
  };
  hostName: string;
}

export default function RoomLobby({ settings, hostName }: RoomLobbyProps) {
  const { setPlayers, setRoomId, startGame } = useGame();
  const [roomId, setLocalRoomId] = useState<string | null>(null);
  const [players, setLocalPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!roomId) return;

    // Poll for player updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setLocalPlayers(data.room.players);
        }
      } catch (err) {
        console.error('Failed to fetch room updates:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId]);

  const createRoom = async () => {
    try {
      setLoading(true);
      const hostId = 'host-' + Date.now();
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId,
          hostName,
          settings,
        }),
      });

      if (!response.ok) throw new Error('Failed to create room');

      const data = await response.json();
      const roomId = data.room.id;

      // Save host session
      savePlayerSession({
        playerId: hostId,
        playerName: hostName,
        roomId,
        isHost: true,
      });

      setLocalRoomId(roomId);
      setRoomId(roomId);
      setLoading(false);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (players.length >= 3) {
      try {
        // Call the start game API to assign roles
        const response = await fetch(`/api/rooms/${roomId}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to start game');
        }

        // Redirect to role reveal (host is also a player)
        window.location.href = '/role-reveal';
      } catch (err) {
        console.error('Failed to start game:', err);
        setError('Failed to start game. Please try again.');
      }
    }
  };

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${roomId}`
    : '';

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Creating room...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>{error}</div>
          <button onClick={createRoom} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Room Created!</h1>
        <p className={styles.subtitle}>Players can join using the code or QR</p>

        <div className={styles.roomCode}>
          <div className={styles.codeLabel}>Room Code</div>
          <div className={styles.code}>{roomId}</div>
        </div>

        <div className={styles.qrSection}>
          <QRCodeSVG value={joinUrl} size={200} level="H" />
          <p className={styles.qrHint}>Scan to join</p>
        </div>

        <div className={styles.urlSection}>
          <input
            type="text"
            value={joinUrl}
            readOnly
            className={styles.urlInput}
          />
          <button
            onClick={() => navigator.clipboard.writeText(joinUrl)}
            className={styles.copyButton}
          >
            Copy Link
          </button>
        </div>

        <div className={styles.playersSection}>
          <h2 className={styles.playersTitle}>
            Joined Players ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className={styles.noPlayers}>Waiting for players to join...</p>
          ) : (
            <div className={styles.playersList}>
              {players.map((player, index) => (
                <div key={index} className={styles.playerItem}>
                  <span className={styles.playerNumber}>{index + 1}</span>
                  <span className={styles.playerName}>{player}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleStartGame}
          disabled={players.length < 3}
          className={styles.startButton}
        >
          Start Game
        </button>

        {players.length < 3 && (
          <p className={styles.warning}>Minimum 3 players required</p>
        )}
      </div>
    </div>
  );
}
