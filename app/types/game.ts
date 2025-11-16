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

export interface Player {
  id: string;
  name: string;
  isSpy: boolean;
  hasSeenRole: boolean;
  role?: string;
}

export interface LocationTranslations {
  en: string;
  fa: string;
  sv: string;
  zh: string;
  hi: string;
  es: string;
  fr: string;
  ar: string;
}

export interface Location {
  name: LocationTranslations;
  roles: string[];
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  roomId: string | null;
  players: Player[];
  secretLocation: Location | null;
  spyId: string | null;
  currentRevealIndex: number;
  timerDuration: number; // in minutes
  includeRoles: boolean;
  language: Language;
  gameStartTime: number | null;
  votedSpyId: string | null;
  spyGuessedLocation: string | null;
}

export interface GameActions {
  setPlayers: (names: string[]) => void;
  setTimerDuration: (minutes: number) => void;
  setIncludeRoles: (include: boolean) => void;
  setLanguage: (language: Language) => void;
  setMode: (mode: GameMode) => void;
  setRoomId: (roomId: string) => void;
  startGame: () => void;
  nextReveal: () => void;
  startTimer: () => void;
  endGame: () => void;
  voteForSpy: (playerId: string) => void;
  spyGuessLocation: (locationName: string) => void;
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
  };
  status: 'waiting' | 'playing' | 'finished';
  gamePhase?: 'waiting' | 'revealing' | 'timer' | 'voting' | 'results';
  location?: Location | null;
  playerRoles?: PlayerRole[];
  votes?: PlayerVote[];
  gameStartTime?: number | null;
  createdAt: number;
}
