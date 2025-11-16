interface PlayerSession {
  playerId: string;
  playerName: string;
  roomId: string;
  isHost: boolean;
}

const SESSION_KEY = 'spy-game-session';

export function savePlayerSession(session: PlayerSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getPlayerSession(): PlayerSession | null {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearPlayerSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isHost(): boolean {
  const session = getPlayerSession();
  return session?.isHost ?? false;
}

export function isPlayer(): boolean {
  const session = getPlayerSession();
  return session !== null && !session.isHost;
}
