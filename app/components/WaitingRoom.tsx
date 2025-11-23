'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerSession, clearPlayerSession } from '../utils/playerSession';
import styles from './WaitingRoom.module.css';

export default function WaitingRoom() {
  const router = useRouter();
  const [players, setPlayers] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getPlayerSession();
    if (!session || session.isHost) {
      router.push('/');
      return;
    }

    setRoomId(session.roomId);
    setPlayerName(session.playerName);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!roomId) return;

    // Poll for room updates (player list and game status)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.room.players);

          // Check if game has started
          if (data.room.status === 'playing') {
            // Game has started! Redirect to role reveal
            router.push('/role-reveal');
          }
        } else if (response.status === 404) {
          setError('Room not found or has been closed');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Failed to fetch room updates:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId, router]);

  const handleLeave = () => {
    clearPlayerSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>{error}</div>
          <button onClick={handleLeave} className={styles.leaveButton}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Waiting for Game to Start</h1>
        <p className={styles.subtitle}>Room: {roomId}</p>

        <div className={styles.playerCard}>
          <div className={styles.playerLabel}>You are</div>
          <div data-testid="player-name-display" className={styles.playerNameDisplay}>{playerName}</div>
        </div>

        <div className={styles.playersSection}>
          <h2 className={styles.playersTitle}>
            Players in Room ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className={styles.noPlayers}>Loading players...</p>
          ) : (
            <div className={styles.playersList}>
              {players.map((player, index) => (
                <div key={index} className={styles.playerItem}>
                  <span className={styles.playerNumber}>{index + 1}</span>
                  <span className={styles.playerName}>
                    {player}
                    {player === playerName && (
                      <span className={styles.youBadge}> (You)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.waitingInfo}>
          <div className={styles.spinner}></div>
          <p>Waiting for host to start the game...</p>
        </div>

        <button onClick={handleLeave} className={styles.leaveButton}>
          Leave Room
        </button>
      </div>
    </div>
  );
}
