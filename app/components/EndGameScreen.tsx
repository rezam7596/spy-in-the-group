'use client';

import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { DEFAULT_LOCATIONS } from '../data/locations';
import styles from './EndGameScreen.module.css';

export default function EndGameScreen() {
  const {
    phase,
    players,
    secretLocation,
    spyId,
    votedSpyId,
    spyGuessedLocation,
    language,
    voteForSpy,
    spyGuessLocation,
    resetGame,
  } = useGame();

  const [showSpyGuess, setShowSpyGuess] = useState(false);

  const spy = players.find((p) => p.id === spyId);
  const votedPlayer = players.find((p) => p.id === votedSpyId);
  const locationName = secretLocation?.name[language] || '';

  const handleVote = (playerId: string) => {
    voteForSpy(playerId);
  };

  const handleSpyGuess = (locationName: string) => {
    spyGuessLocation(locationName);
  };

  if (phase === 'voting') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Time to Vote!</h1>
          <p className={styles.subtitle}>Who do you think is the spy?</p>

          <div className={styles.playersGrid}>
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleVote(player.id)}
                className={styles.playerButton}
              >
                {player.name}
              </button>
            ))}
          </div>

          <div className={styles.divider}>OR</div>

          <button
            onClick={() => setShowSpyGuess(true)}
            className={styles.spyGuessButton}
          >
            Let the Spy Guess the Location
          </button>

          {showSpyGuess && (
            <div className={styles.locationGuess}>
              <h3 className={styles.guessTitle}>
                {spy?.name}, pick the location:
              </h3>
              <div className={styles.locationsGrid}>
                {DEFAULT_LOCATIONS.map((location) => (
                  <button
                    key={location.name.en}
                    onClick={() => handleSpyGuess(location.name[language])}
                    className={styles.locationButton}
                  >
                    {location.name[language]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    let winner = '';
    let message = '';

    if (votedSpyId) {
      // Players voted
      if (votedSpyId === spyId) {
        winner = 'Non-Spies Win!';
        message = `Correct! ${spy?.name} was the spy!`;
      } else {
        winner = 'Spy Wins!';
        message = `Wrong! ${votedPlayer?.name} is not the spy. The spy was ${spy?.name}!`;
      }
    } else if (spyGuessedLocation) {
      // Spy guessed
      if (spyGuessedLocation === locationName) {
        winner = 'Spy Wins!';
        message = `${spy?.name} correctly guessed the location!`;
      } else {
        winner = 'Non-Spies Win!';
        message = `${spy?.name} guessed wrong! The location was ${locationName}.`;
      }
    }

    const isSpyWin = winner.includes('Spy Wins');

    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.resultsContainer}>
            <div className={`${styles.winnerBadge} ${isSpyWin ? styles.spyWin : styles.innocentWin}`}>
              {winner}
            </div>

            <p className={styles.resultMessage}>{message}</p>

            <div className={styles.gameInfo}>
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>The Spy</div>
                <div className={styles.infoValue}>🕵️ {spy?.name}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Secret Location</div>
                <div className={styles.infoValue}>📍 {locationName}</div>
              </div>
            </div>

            <div className={styles.allPlayers}>
              <h3 className={styles.playersLabel}>All Players</h3>
              <div className={styles.playersResultList}>
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`${styles.playerResult} ${
                      player.id === spyId ? styles.spyPlayer : ''
                    }`}
                  >
                    <span>{player.name}</span>
                    {player.id === spyId && <span className={styles.spyBadge}>SPY</span>}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={resetGame} className={styles.playAgainButton}>
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
