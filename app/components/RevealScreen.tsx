'use client';

import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import styles from './RevealScreen.module.css';

export default function RevealScreen() {
  const { players, currentRevealIndex, secretWord, includeRoles, language, nextReveal } = useGame();
  const [revealed, setRevealed] = useState(false);

  const currentPlayer = players[currentRevealIndex];
  const isSpy = currentPlayer?.isSpy;
  const wordName = secretWord?.name[language] || '';

  const handleReady = () => {
    setRevealed(true);
  };

  const handleGotIt = () => {
    setRevealed(false);
    nextReveal();
  };

  if (!currentPlayer) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!revealed ? (
          <>
            <div className={styles.passDevice}>
              <h1 className={styles.title}>Pass the device to</h1>
              <div className={styles.playerName}>{currentPlayer.name}</div>
              <p className={styles.instruction}>
                Make sure no one else is looking!
              </p>
            </div>
            <button onClick={handleReady} className={styles.readyButton}>
              I'm Ready
            </button>
          </>
        ) : (
          <>
            {isSpy ? (
              <div className={styles.roleReveal}>
                <div className={styles.spyIcon}>🕵️</div>
                <h1 className={styles.roleTitle}>You are the SPY!</h1>
                <div className={styles.roleDescription}>
                  <p>Try to discover the secret word without revealing yourself.</p>
                  <p>Ask questions to blend in and gather clues.</p>
                  <p className={styles.warning}>
                    Don't be too obvious that you don't know the word!
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.roleReveal}>
                <div className={styles.locationIcon}>📍</div>
                <h1 className={styles.roleTitle}>You are NOT the spy</h1>
                <div className={styles.locationBox}>
                  <div className={styles.locationLabel}>Secret Word:</div>
                  <div className={styles.locationName}>{wordName}</div>
                </div>
                {includeRoles && currentPlayer.role && (
                  <div className={styles.roleBox}>
                    <div className={styles.roleLabel}>Your Role:</div>
                    <div className={styles.roleName}>{currentPlayer.role}</div>
                  </div>
                )}
                <div className={styles.roleDescription}>
                  <p>Find the spy by asking questions.</p>
                  <p className={styles.warning}>
                    Be careful not to reveal the word too obviously!
                  </p>
                </div>
              </div>
            )}
            <button onClick={handleGotIt} className={styles.gotItButton}>
              Got it!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
