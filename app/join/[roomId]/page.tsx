'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { savePlayerSession } from '../../utils/playerSession';
import styles from './JoinPage.module.css';

export default function JoinPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      // Save player session
      savePlayerSession({
        playerId: `player-${Date.now()}`,
        playerName: playerName.trim(),
        roomId,
        isHost: false,
      });

      // Redirect to waiting screen
      router.push(`/`);
    } catch (err) {
      setError('Failed to join room. The room may not exist or has already started.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Join Game</h1>
        <p className={styles.subtitle}>Room: {roomId}</p>

        <div className={styles.formSection}>
          <label className={styles.label}>Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter your name"
            className={styles.input}
            autoFocus
          />

          {error && <div className={styles.error}>{error}</div>}

          <button
            onClick={handleJoin}
            disabled={loading || !playerName.trim()}
            className={styles.joinButton}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>

        <div className={styles.hint}>
          <p>Enter your name to join this game</p>
          <p>The host will start the game when everyone has joined</p>
        </div>
      </div>
    </div>
  );
}
