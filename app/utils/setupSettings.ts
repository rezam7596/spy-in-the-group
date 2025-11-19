import { GameMode, Language, Category, Difficulty } from '../types/game';

const SETUP_SETTINGS_KEY = 'spy-game-setup-settings';
const SETTINGS_VERSION = 2;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const ALL_CATEGORIES: Category[] = [
  'locations', 'food', 'drinks', 'animals', 'sports',
  'professions', 'countries', 'movies', 'music', 'brands',
  'party', 'celebrities', 'objects', 'hobbies', 'internet'
];

export interface SetupSettings {
  version: number;
  gameMode: GameMode;
  playerNames: string[];
  hostName: string;
  timerDuration: number;
  includeRoles: boolean;
  language: Language;
  categories: Category[];
  difficulty: Difficulty;
  lastUpdated: number;
}

function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function validateSetupSettings(data: any): data is SetupSettings {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.version === 'number' &&
    typeof data.gameMode === 'string' &&
    Array.isArray(data.playerNames) &&
    typeof data.hostName === 'string' &&
    typeof data.timerDuration === 'number' &&
    typeof data.includeRoles === 'boolean' &&
    typeof data.language === 'string' &&
    Array.isArray(data.categories) &&
    typeof data.difficulty === 'string' &&
    typeof data.lastUpdated === 'number'
  );
}

function isSettingsExpired(lastUpdated: number): boolean {
  return Date.now() - lastUpdated > THIRTY_DAYS;
}

export function getDefaultSettings(): Omit<SetupSettings, 'version' | 'lastUpdated'> {
  return {
    gameMode: 'single-device',
    playerNames: ['', '', '', ''],
    hostName: '',
    timerDuration: 8,
    includeRoles: false,
    language: 'en',
    categories: ALL_CATEGORIES, // Default: all categories selected
    difficulty: 'medium',
  };
}

export function saveSetupSettings(
  settings: Omit<SetupSettings, 'version' | 'lastUpdated'>
): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const settingsToSave: SetupSettings = {
      version: SETTINGS_VERSION,
      ...settings,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(SETUP_SETTINGS_KEY, JSON.stringify(settingsToSave));
  } catch (error) {
    console.error('Failed to save setup settings:', error);
  }
}

export function loadSetupSettings(): Omit<SetupSettings, 'version' | 'lastUpdated'> | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const data = localStorage.getItem(SETUP_SETTINGS_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);

    if (!validateSetupSettings(parsed)) {
      console.warn('Invalid setup settings data, clearing...');
      clearSetupSettings();
      return null;
    }

    // Check if settings are expired
    if (isSettingsExpired(parsed.lastUpdated)) {
      console.info('Setup settings expired, clearing...');
      clearSetupSettings();
      return null;
    }

    // Check version compatibility
    if (parsed.version !== SETTINGS_VERSION) {
      console.info('Setup settings version mismatch, clearing...');
      clearSetupSettings();
      return null;
    }

    // Return settings without version and lastUpdated
    const { version, lastUpdated, ...settings } = parsed;
    return settings;
  } catch (error) {
    console.error('Failed to load setup settings:', error);
    clearSetupSettings();
    return null;
  }
}

export function clearSetupSettings(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(SETUP_SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear setup settings:', error);
  }
}
