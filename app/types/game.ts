export type GamePhase =
  | 'setup'
  | 'reveal'
  | 'playing'
  | 'voting'
  | 'results';

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
  startGame: () => void;
  nextReveal: () => void;
  startTimer: () => void;
  endGame: () => void;
  voteForSpy: (playerId: string) => void;
  spyGuessLocation: (locationName: string) => void;
  resetGame: () => void;
}
