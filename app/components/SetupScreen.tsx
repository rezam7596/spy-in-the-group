'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useGame} from '../contexts/GameContext';
import {GameMode, Language, Category, Difficulty} from '../types/game';
import {loadSetupSettings, saveSetupSettings} from '../utils/setupSettings';
import {savePlayerSession} from '../utils/playerSession';
import styles from './SetupScreen.module.css';

const LANGUAGES = [
  {code: 'en' as Language, name: 'English', flag: '🇬🇧'},
  {code: 'fa' as Language, name: 'فارسی', flag: '🇮🇷'},
  {code: 'sv' as Language, name: 'Svenska', flag: '🇸🇪'},
  {code: 'zh' as Language, name: '中文', flag: '🇨🇳'},
  {code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳'},
  {code: 'es' as Language, name: 'Español', flag: '🇪🇸'},
  {code: 'fr' as Language, name: 'Français', flag: '🇫🇷'},
  {code: 'ar' as Language, name: 'العربية', flag: '🇸🇦'},
];

const CATEGORIES = [
  {code: 'locations' as Category, name: 'Locations', emoji: '📍'},
  {code: 'food' as Category, name: 'Food & Dishes', emoji: '🍕'},
  {code: 'drinks' as Category, name: 'Drinks & Beverages', emoji: '☕'},
  {code: 'animals' as Category, name: 'Animals', emoji: '🐶'},
  {code: 'sports' as Category, name: 'Sports & Games', emoji: '⚽'},
  {code: 'professions' as Category, name: 'Professions', emoji: '👨‍⚕️'},
  {code: 'countries' as Category, name: 'Countries', emoji: '🌍'},
  {code: 'movies' as Category, name: 'Movies & TV Shows', emoji: '🎬'},
  {code: 'music' as Category, name: 'Music Artists', emoji: '🎵'},
  {code: 'brands' as Category, name: 'Brands', emoji: '🏷️'},
  {code: 'party' as Category, name: 'Party & Drinking', emoji: '🍻'},
  {code: 'celebrities' as Category, name: 'Celebrities', emoji: '⭐'},
  {code: 'objects' as Category, name: 'Objects & Items', emoji: '📱'},
  {code: 'hobbies' as Category, name: 'Hobbies & Pastimes', emoji: '🎨'},
  {code: 'internet' as Category, name: 'Internet & Pop Culture', emoji: '🌐'},
];

const DIFFICULTIES = [
  {code: 'easy' as Difficulty, name: 'Easy', desc: 'Very common words'},
  {code: 'medium' as Difficulty, name: 'Medium', desc: 'Moderate difficulty'},
  {code: 'hard' as Difficulty, name: 'Hard', desc: 'Rare but fun words'},
];

export default function SetupScreen() {
  const router = useRouter();
  const {setPlayers, setTimerDuration, setIncludeRoles, setLanguage, setCategories, setDifficulty, setMode, startGame} = useGame();
  const [gameMode, setGameMode] = useState<GameMode>('single-device');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [hostName, setHostName] = useState<string>('');
  const [duration, setDuration] = useState(8);
  const [includeRoles, setIncludeRolesLocal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    CATEGORIES.map(c => c.code) // Default: all categories selected
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Check if roles should be available (only when locations is the sole category)
  const showRolesToggle = selectedCategories.length === 1 && selectedCategories[0] === 'locations';

  // Calculate how many items to show in first row
  const CATEGORIES_PER_ROW = 2;
  const LANGUAGES_PER_ROW = 3;
  const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, CATEGORIES_PER_ROW);
  const visibleLanguages = showAllLanguages ? LANGUAGES : LANGUAGES.slice(0, LANGUAGES_PER_ROW);

  // Load saved settings on mount
  useEffect(() => {
    const saved = loadSetupSettings();
    if (saved) {
      setGameMode(saved.gameMode);
      setPlayerNames(saved.playerNames);
      setHostName(saved.hostName);
      setDuration(saved.timerDuration);
      setIncludeRolesLocal(saved.includeRoles);
      setSelectedLanguage(saved.language);
      if (saved.categories) {
        setSelectedCategories(saved.categories);
      }
      if (saved.difficulty) {
        setSelectedDifficulty(saved.difficulty);
      }
    }
  }, []);

  // Save settings with debounce when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveSetupSettings({
        gameMode,
        playerNames,
        hostName,
        timerDuration: duration,
        includeRoles,
        language: selectedLanguage,
        categories: selectedCategories,
        difficulty: selectedDifficulty,
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [gameMode, playerNames, hostName, duration, includeRoles, selectedLanguage, selectedCategories, selectedDifficulty]);

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex === dropIndex) return;

    const newNames = [...playerNames];
    const [draggedItem] = newNames.splice(dragIndex, 1);
    newNames.splice(dropIndex, 0, draggedItem);
    setPlayerNames(newNames);
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === CATEGORIES.length) {
      // If all selected, keep only locations
      setSelectedCategories(['locations']);
    } else {
      // Select all
      setSelectedCategories(CATEGORIES.map(c => c.code));
    }
  };

  const handleContinue = async () => {
    setTimerDuration(duration);
    setIncludeRoles(showRolesToggle ? includeRoles : false); // Only set roles if locations is sole category
    setLanguage(selectedLanguage);
    setCategories(selectedCategories);
    setDifficulty(selectedDifficulty);
    setMode(gameMode);

    if (gameMode === 'single-device') {
      const validNames = playerNames.filter((name) => name.trim() !== '');
      if (validNames.length >= 3) {
        setPlayers(validNames);
        startGame();
      }
    } else {
      // Multi-device mode - create room and redirect to lobby
      setIsCreating(true);
      setError(null);

      try {
        const hostId = `host-${Date.now()}`;
        const response = await fetch('/api/rooms/create', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            hostId,
            hostName: hostName.trim(),
            settings: {
              timerDuration: duration,
              includeRoles: showRolesToggle ? includeRoles : false,
              language: selectedLanguage,
              categories: selectedCategories,
              difficulty: selectedDifficulty,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create room');
        }

        const data = await response.json();
        const roomId = data.room.id;

        // Save host session
        savePlayerSession({
          playerId: hostId,
          playerName: hostName.trim(),
          roomId,
          isHost: true,
        });

        // Redirect to unified lobby
        router.push(`/join/${roomId}`);
      } catch (err) {
        console.error('Failed to create room:', err);
        setError('Failed to create room. Please try again.');
        setIsCreating(false);
      }
    }
  };

  const validNames = playerNames.filter((name) => name.trim() !== '');
  const canStart = gameMode === 'single-device'
    ? validNames.length >= 3
    : hostName.trim() !== '';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Spy in the Group</h1>
        <p className={styles.subtitle}>Setup your game</p>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Game Mode</h2>
          <div className={styles.rolesToggle}>
            <button
              onClick={() => setGameMode('single-device')}
              className={`${styles.modeButton} ${
                gameMode === 'single-device' ? styles.active : ''
              }`}
            >
              <div className={styles.modeTitle}>📱 Single Device</div>
              <div className={styles.modeDesc}>Pass and play on one device</div>
            </button>
            <button
              onClick={() => setGameMode('multi-device')}
              className={`${styles.modeButton} ${
                gameMode === 'multi-device' ? styles.active : ''
              }`}
            >
              <div className={styles.modeTitle}>🌐 Multi Device</div>
              <div className={styles.modeDesc}>Players join via link/QR code</div>
            </button>
          </div>
        </div>

        {gameMode === 'multi-device' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Name (Host)</h2>
            <div className={styles.playersList}>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className={styles.input}
              />
              <p className={styles.helperText}>
                You will be the first player. Others can join via QR code.
              </p>
            </div>
          </div>
        )}

        {gameMode === 'single-device' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Players ({validNames.length})</h2>
            <div className={styles.playersList}>
              {playerNames.map((name, index) => (
                <div
                  key={index}
                  className={styles.playerInput}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className={styles.dragHandle} title="Drag to reorder">
                    ☰
                  </div>
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
                      title="Remove player"
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
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Word Categories ({selectedCategories.length}/{CATEGORIES.length})
            </h2>
            <button onClick={toggleAllCategories} className={styles.selectAllButton}>
              {selectedCategories.length === CATEGORIES.length ? '✓ All' : 'Select All'}
            </button>
          </div>
          <div className={styles.categoryGrid}>
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.code);
              return (
                <button
                  key={cat.code}
                  onClick={() => toggleCategory(cat.code)}
                  className={`${styles.categoryButton} ${
                    isSelected ? styles.active : ''
                  }`}
                  title={cat.name}
                >
                  <span className={styles.categoryEmoji}>{cat.emoji}</span>
                  <span className={styles.categoryName}>{cat.name}</span>
                  {isSelected && <span className={styles.checkmark}>✓</span>}
                </button>
              );
            })}
          </div>
          {CATEGORIES.length > CATEGORIES_PER_ROW && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className={styles.expandButton}
            >
              {showAllCategories ? '▲ Show Less' : `▼ Show More (${CATEGORIES.length - CATEGORIES_PER_ROW} more)`}
            </button>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Difficulty Level</h2>
          <div className={styles.difficultyGrid}>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.code}
                onClick={() => setSelectedDifficulty(diff.code)}
                className={`${styles.timerButton} ${
                  selectedDifficulty === diff.code ? styles.active : ''
                }`}
              >
                <div>{diff.name}</div>
                <div className={styles.difficultyDesc}>{diff.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Language</h2>
          <div className={styles.languageGrid}>
            {visibleLanguages.map((lang) => (
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
          {LANGUAGES.length > LANGUAGES_PER_ROW && (
            <button
              onClick={() => setShowAllLanguages(!showAllLanguages)}
              className={styles.expandButton}
            >
              {showAllLanguages ? '▲ Show Less' : `▼ Show More (${LANGUAGES.length - LANGUAGES_PER_ROW} more)`}
            </button>
          )}
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

        {showRolesToggle && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Game Mode</h2>
            <div className={styles.rolesToggle}>
              <button
                onClick={() => setIncludeRolesLocal(false)}
                className={`${styles.modeButton} ${
                  !includeRoles ? styles.active : ''
                }`}
              >
                <div className={styles.modeTitle}>Word Only</div>
                <div className={styles.modeDesc}>Players only see the word</div>
              </button>
              <button
                onClick={() => setIncludeRolesLocal(true)}
                className={`${styles.modeButton} ${
                  includeRoles ? styles.active : ''
                }`}
              >
                <div className={styles.modeTitle}>Word + Role</div>
                <div className={styles.modeDesc}>Players see word and their role</div>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!canStart || isCreating}
          className={styles.startButton}
        >
          {gameMode === 'single-device'
            ? 'Start Game'
            : isCreating
              ? 'Creating Room...'
              : 'Create Room'}
        </button>

        {!canStart && gameMode === 'single-device' && (
          <p className={styles.warning}>Minimum 3 players required</p>
        )}

        {!canStart && gameMode === 'multi-device' && (
          <p className={styles.warning}>Please enter your name</p>
        )}

        {error && (
          <p className={styles.warning}>{error}</p>
        )}
      </div>
    </div>
  );
}
