'use client';

import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { getFilteredWords } from '../data/words';
import styles from './EndGameScreen.module.css';

export default function EndGameScreen() {
  const {
    phase,
    players,
    secretWord,
    spyId,
    votedSpyId,
    spyGuessedWord,
    language,
    selectedCategories,
    selectedDifficulty,
    voteForSpy,
    spyGuessWord,
    resetGame,
  } = useGame();

  const [showSpyGuess, setShowSpyGuess] = useState(false);

  const spy = players.find((p) => p.id === spyId);
  const votedPlayer = players.find((p) => p.id === votedSpyId);
  const wordName = secretWord?.name[language] || '';

  // Get all possible words from the selected categories and difficulty
  const possibleWords = getFilteredWords(selectedCategories, selectedDifficulty);

  const handleVote = (playerId: string) => {
    voteForSpy(playerId);
  };

  const handleSpyGuess = (wordName: string) => {
    spyGuessWord(wordName);
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
                data-testid={`vote-player-${player.name}`}
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
            Let the Spy Guess the Word
          </button>

          {showSpyGuess && (
            <div className={styles.locationGuess}>
              <h3 className={styles.guessTitle}>
                {spy?.name}, pick the word:
              </h3>
              <div className={styles.locationsGrid}>
                {possibleWords.map((word) => (
                  <button
                    key={word.name.en}
                    onClick={() => handleSpyGuess(word.name[language])}
                    className={styles.locationButton}
                    data-testid="spy-guess-word"
                  >
                    {word.name[language]}
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
    } else if (spyGuessedWord) {
      // Spy guessed
      if (spyGuessedWord === wordName) {
        winner = 'Spy Wins!';
        message = `${spy?.name} correctly guessed the word!`;
      } else {
        winner = 'Non-Spies Win!';
        message = `${spy?.name} guessed wrong! The word was ${wordName}.`;
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
                <div className={styles.infoLabel}>Secret Word</div>
                <div className={styles.infoValue}>✨ {wordName}</div>
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
