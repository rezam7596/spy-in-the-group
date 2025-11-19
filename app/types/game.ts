export type GamePhase =
  | 'setup'
  | 'reveal'
  | 'playing'
  | 'voting'
  | 'results';

export type GameMode =
  | 'single-device'
  | 'multi-device';

export type Language =
  | 'en'
  | 'fa'
  | 'sv'
  | 'zh'
  | 'hi'
  | 'es'
  | 'fr'
  | 'ar';

export type Category =
  | 'locations'
  | 'food'
  | 'drinks'
  | 'animals'
  | 'sports'
  | 'professions'
  | 'countries'
  | 'movies'
  | 'music'
  | 'brands'
  | 'party'
  | 'celebrities'
  | 'objects'
  | 'hobbies'
  | 'internet';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  isSpy: boolean;
  hasSeenRole: boolean;
  role?: string;
}

export interface WordTranslations {
  en: string;
  fa: string;
  sv: string;
  zh: string;
  hi: string;
  es: string;
  fr: string;
  ar: string;
}

export interface Word {
  name: WordTranslations;
  roles?: string[]; // Only for locations category
  category?: Category;
  difficulty?: Difficulty;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  roomId: string | null;
  players: Player[];
  secretWord: Word | null;
  spyId: string | null;
  currentRevealIndex: number;
  timerDuration: number; // in minutes
  includeRoles: boolean;
  language: Language;
  selectedCategories: Category[];
  selectedDifficulty: Difficulty;
  gameStartTime: number | null;
  votedSpyId: string | null;
  spyGuessedWord: string | null;
}

export interface GameActions {
  setPlayers: (names: string[]) => void;
  setTimerDuration: (minutes: number) => void;
  setIncludeRoles: (include: boolean) => void;
  setLanguage: (language: Language) => void;
  setCategories: (categories: Category[]) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setMode: (mode: GameMode) => void;
  setRoomId: (roomId: string) => void;
  startGame: () => void;
  nextReveal: () => void;
  startTimer: () => void;
  endGame: () => void;
  voteForSpy: (playerId: string) => void;
  spyGuessWord: (wordName: string) => void;
  resetGame: () => void;
}

// API types for room management
export interface PlayerRole {
  playerName: string;
  isSpy: boolean;
  role?: string; // Only for non-spy players if includeRoles is true
  hasConfirmed: boolean;
}

export interface PlayerVote {
  voterName: string;
  votedForName: string;
}

export interface Room {
  id: string;
  hostId: string;
  players: string[];
  settings: {
    timerDuration: number;
    includeRoles: boolean;
    language: Language;
    categories: Category[];
    difficulty: Difficulty;
  };
  status: 'waiting' | 'playing' | 'finished';
  gamePhase?: 'waiting' | 'revealing' | 'timer' | 'voting' | 'results';
  word?: Word | null;
  playerRoles?: PlayerRole[];
  votes?: PlayerVote[];
  gameStartTime?: number | null;
  createdAt: number;
}
