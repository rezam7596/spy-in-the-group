'use client';

import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Language } from '../types/game';
import styles from './SetupScreen.module.css';

const LANGUAGES = [
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'fa' as Language, name: 'فارسی', flag: '🇮🇷' },
  { code: 'sv' as Language, name: 'Svenska', flag: '🇸🇪' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
];

export default function SetupScreen() {
  const { setPlayers, setTimerDuration, setIncludeRoles, setLanguage, startGame } = useGame();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [duration, setDuration] = useState(8);
  const [includeRoles, setIncludeRolesLocal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  const handleAddPlayer = () => {
    setPlayerNames([...playerNames, '']);
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length > 3) {
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    const validNames = playerNames.filter((name) => name.trim() !== '');
    if (validNames.length >= 3) {
      setPlayers(validNames);
      setTimerDuration(duration);
      setIncludeRoles(includeRoles);
      setLanguage(selectedLanguage);
      startGame();
    }
  };

  const validNames = playerNames.filter((name) => name.trim() !== '');
  const canStart = validNames.length >= 3;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Spy in the Group</h1>
        <p className={styles.subtitle}>Setup your game</p>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Players ({validNames.length})</h2>
          <div className={styles.playersList}>
            {playerNames.map((name, index) => (
              <div key={index} className={styles.playerInput}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className={styles.input}
                />
                {playerNames.length > 3 && (
                  <button
                    onClick={() => handleRemovePlayer(index)}
                    className={styles.removeButton}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {playerNames.length < 10 && (
            <button onClick={handleAddPlayer} className={styles.addButton}>
              + Add Player
            </button>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Language</h2>
          <div className={styles.languageGrid}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`${styles.languageButton} ${
                  selectedLanguage === lang.code ? styles.active : ''
                }`}
              >
                <span className={styles.languageFlag}>{lang.flag}</span>
                <span className={styles.languageName}>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Game Duration</h2>
          <div className={styles.timerOptions}>
            {[5, 6, 8, 10].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setDuration(minutes)}
                className={`${styles.timerButton} ${
                  duration === minutes ? styles.active : ''
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Game Mode</h2>
          <div className={styles.rolesToggle}>
            <button
              onClick={() => setIncludeRolesLocal(false)}
              className={`${styles.modeButton} ${
                !includeRoles ? styles.active : ''
              }`}
            >
              <div className={styles.modeTitle}>Location Only</div>
              <div className={styles.modeDesc}>Players only see the location</div>
            </button>
            <button
              onClick={() => setIncludeRolesLocal(true)}
              className={`${styles.modeButton} ${
                includeRoles ? styles.active : ''
              }`}
            >
              <div className={styles.modeTitle}>Location + Role</div>
              <div className={styles.modeDesc}>Players see location and their role</div>
            </button>
          </div>
        </div>

        <button
          onClick={handleStartGame}
          disabled={!canStart}
          className={styles.startButton}
        >
          Start Game
        </button>

        {!canStart && (
          <p className={styles.warning}>Minimum 3 players required</p>
        )}
      </div>
    </div>
  );
}
