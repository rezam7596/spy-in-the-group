'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerSession, clearPlayerSession } from '../utils/playerSession';
import styles from './TimerPage.module.css';

export default function TimerPage() {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerDuration, setTimerDuration] = useState<number>(8);
  const [playerName, setPlayerName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [endingGame, setEndingGame] = useState(false);

  useEffect(() => {
    const session = getPlayerSession();
    if (!session) {
      router.push('/');
      return;
    }

    setPlayerName(session.playerName);
    setRoomId(session.roomId);
    setIsHost(session.isHost);

    // Fetch room data to get game start time and duration
    fetchRoomData(session.roomId);

    // Poll for game phase changes
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${session.roomId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.room.gamePhase === 'voting') {
            // Voting started, redirect to voting page
            router.push('/vote');
          }
        }
      } catch (err) {
        console.error('Failed to check game phase:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  const fetchRoomData = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.room.gameStartTime && data.room.settings.timerDuration) {
          setGameStartTime(data.room.gameStartTime);
          setTimerDuration(data.room.settings.timerDuration);
        }
      }
    } catch (err) {
      console.error('Failed to fetch room data:', err);
    }
  };

  useEffect(() => {
    if (!gameStartTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - gameStartTime;
      const totalTime = timerDuration * 60 * 1000; // Convert minutes to milliseconds
      const remaining = Math.max(0, totalTime - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Timer ended
        return true;
      }
      return false;
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(() => {
      const ended = updateTimer();
      if (ended) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStartTime, timerDuration]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartVoting = async () => {
    if (!isHost) return;

    try {
      setEndingGame(true);
      const response = await fetch(`/api/rooms/${roomId}/start-voting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Redirect to voting page
        router.push('/vote');
      } else {
        setEndingGame(false);
      }
    } catch (err) {
      console.error('Failed to start voting:', err);
      setEndingGame(false);
    }
  };

  const handleLeaveGame = () => {
    clearPlayerSession();
    router.push('/');
  };

  const progress = gameStartTime
    ? Math.max(0, Math.min(100, (timeRemaining / (timerDuration * 60 * 1000)) * 100))
    : 100;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Game in Progress</h1>
          <div className={styles.playerBadge}>{playerName}</div>
        </div>

        <div className={styles.timerCard}>
          <div className={styles.timerLabel}>Time Remaining</div>
          <div className={styles.timerDisplay}>
            {formatTime(timeRemaining)}
          </div>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className={styles.instructions}>
          <h2 className={styles.instructionsTitle}>How to Play</h2>
          <ul className={styles.instructionsList}>
            <li>
              <strong>Regular Players:</strong> Ask questions to figure out who the spy is
            </li>
            <li>
              <strong>The Spy:</strong> Try to figure out the word without revealing yourself
            </li>
            <li>
              <strong>Discussion:</strong> Take turns asking each other questions
            </li>
            <li>
              <strong>Vote:</strong> When time is up or you&apos;re ready, vote for who you think is the spy
            </li>
          </ul>
        </div>

        <div className={styles.roomInfo}>
          <span className={styles.roomLabel}>Room:</span>
          <span className={styles.roomCode}>{roomId}</span>
        </div>

        {isHost ? (
          <button
            onClick={handleStartVoting}
            disabled={endingGame}
            className={styles.startVotingButton}
          >
            {endingGame ? 'Starting Voting...' : 'Start Voting'}
          </button>
        ) : (
          <div className={styles.waitingForHost}>
            <p>Waiting for host to start voting...</p>
          </div>
        )}

        <button onClick={handleLeaveGame} className={styles.leaveButton}>
          Leave Game
        </button>

        {timeRemaining === 0 && (
          <div className={styles.timeUpBanner}>
            <div className={styles.timeUpIcon}>⏰</div>
            <div className={styles.timeUpText}>Time&apos;s Up!</div>
          </div>
        )}
      </div>
    </div>
  );
}
