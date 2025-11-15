'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import styles from './TimerScreen.module.css';

export default function TimerScreen() {
  const { players, timerDuration, gameStartTime, endGame, startTimer } = useGame();
  const [timeRemaining, setTimeRemaining] = useState(timerDuration * 60);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!gameStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      const remaining = timerDuration * 60 - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameStartTime, timerDuration]);

  const handleStart = () => {
    startTimer();
    setStarted(true);
  };

  const handleEndGame = () => {
    endGame();
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / (timerDuration * 60)) * 100;

  const getTimerColor = () => {
    if (percentage > 50) return '#10b981';
    if (percentage > 20) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Game in Progress</h1>

        {!started ? (
          <>
            <div className={styles.instructions}>
              <h2>How to Play:</h2>
              <ul>
                <li>Take turns asking each other questions</li>
                <li>Non-spies: Try to find the spy without revealing the location</li>
                <li>Spy: Blend in and try to guess the location</li>
                <li>Be creative with your questions!</li>
              </ul>
            </div>
            <button onClick={handleStart} className={styles.startButton}>
              Start Timer
            </button>
          </>
        ) : (
          <>
            <div className={styles.timerDisplay}>
              <div
                className={styles.timerCircle}
                style={{
                  background: `conic-gradient(${getTimerColor()} ${percentage}%, #f0f0f0 ${percentage}%)`
                }}
              >
                <div className={styles.timerInner}>
                  <div className={styles.timerText}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.playersList}>
              <h3 className={styles.playersTitle}>Players ({players.length})</h3>
              <div className={styles.playersGrid}>
                {players.map((player) => (
                  <div key={player.id} className={styles.playerChip}>
                    {player.name}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.tips}>
              <p>💡 Ask questions about the location</p>
              <p>👀 Watch for suspicious behavior</p>
              <p>🤔 The spy is trying to blend in</p>
            </div>

            <button onClick={handleEndGame} className={styles.endButton}>
              End Game & Vote
            </button>
          </>
        )}
      </div>
    </div>
  );
}
