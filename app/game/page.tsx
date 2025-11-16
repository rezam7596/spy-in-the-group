'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerSession, clearPlayerSession } from '../utils/playerSession';
import styles from './GamePage.module.css';

export default function GamePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'finished' | null>(null);

  useEffect(() => {
    const session = getPlayerSession();
    if (!session || session.isHost) {
      router.push('/');
      return;
    }

    setPlayerName(session.playerName);
    setRoomId(session.roomId);
  }, [router]);

  useEffect(() => {
    if (!roomId) return;

    // Poll for room status
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setGameStatus(data.room.status);

          // If game is finished, redirect back to home
          if (data.room.status === 'finished') {
            clearPlayerSession();
            router.push('/');
          }
        } else if (response.status === 404) {
          // Room not found, redirect to home
          clearPlayerSession();
          router.push('/');
        }
      } catch (err) {
        console.error('Failed to fetch room status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [roomId, router]);

  const handleLeave = () => {
    clearPlayerSession();
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Game in Progress</h1>
          <div className={styles.playerBadge}>{playerName}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.icon}>🎮</div>
          <h2 className={styles.infoTitle}>Follow the Host&apos;s Screen</h2>
          <p className={styles.infoText}>
            The game is being managed by the host. Please watch the host&apos;s screen
            for instructions and your role reveal.
          </p>
        </div>

        <div className={styles.instructions}>
          <h3 className={styles.instructionsTitle}>What to do:</h3>
          <ul className={styles.instructionsList}>
            <li>Wait for the host to call your name</li>
            <li>When it&apos;s your turn, look at the host&apos;s device to see your role</li>
            <li>Remember your location (or that you&apos;re the spy!)</li>
            <li>Participate in the discussion to find the spy</li>
          </ul>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusDot}></div>
          <span className={styles.statusText}>Game Active - Room {roomId}</span>
        </div>

        <button onClick={handleLeave} className={styles.leaveButton}>
          Leave Game
        </button>
      </div>
    </div>
  );
}
