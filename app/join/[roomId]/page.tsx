'use client';

import {use, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {QRCodeSVG} from 'qrcode.react';
import {clearPlayerSession, getPlayerSession, savePlayerSession} from '../../utils/playerSession';
import styles from './JoinPage.module.css';

export default function JoinPage({params}: { params: Promise<{ roomId: string }> }) {
  const {roomId} = use(params);
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [inLobby, setInLobby] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [currentPlayerName, setCurrentPlayerName] = useState('');

  // Check if player already has a session for this room
  useEffect(() => {
    const checkExistingSession = async () => {
      const session = getPlayerSession();

      // If player has a session for this specific room
      if (session && session.roomId === roomId) {
        try {
          // Verify the session is still valid by checking the room
          const response = await fetch(`/api/rooms/${roomId}`);
          if (response.ok) {
            const data = await response.json();
            const room = data.room;

            // Check if player is still in the room
            if (room && room.players.includes(session.playerName)) {
              // Valid session - show lobby instead of redirecting
              setPlayers(room.players);
              setIsHost(session.isHost);
              setCurrentPlayerName(session.playerName);
              setInLobby(true);
              setCheckingSession(false);
              return;
            }
          }

          // Session is invalid - clear it
          clearPlayerSession();
        } catch (err) {
          console.error('Failed to validate session:', err);
          clearPlayerSession();
        }
      }

      setCheckingSession(false);
    };

    checkExistingSession();
  }, [roomId]);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({playerName: playerName.trim()}),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      // Save player session
      savePlayerSession({
        playerId: `player-${Date.now()}`,
        playerName: playerName.trim(),
        roomId,
        isHost: false,
      });

      // Fetch room data to show lobby
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      if (roomResponse.ok) {
        const roomData = await roomResponse.json();
        setPlayers(roomData.room.players);
        setCurrentPlayerName(playerName.trim());
        setIsHost(false);
        setInLobby(true);
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to join room. The room may not exist or has already started.');
      setLoading(false);
    }
  };

  // Poll for room updates when in lobby
  useEffect(() => {
    if (!inLobby) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          const room = data.room;

          setPlayers(room.players);

          // Check if game has started
          if (room.status === 'playing' && room.gamePhase === 'revealing') {
            clearInterval(interval);
            router.push('/role-reveal');
          }
        } else if (response.status === 404) {
          setError('Room not found or has been closed');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Failed to fetch room updates:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [inLobby, roomId, router]);

  const handleStartGame = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start game');
      }

      // Game will start, polling will detect and redirect
    } catch (err) {
      setError('Failed to start game');
      setLoading(false);
    }
  };

  const handleLeave = () => {
    clearPlayerSession();
    router.push('/');
  };

  const handleCopyLink = async () => {
    const joinUrl = `${window.location.origin}/join/${roomId}`;
    try {
      await navigator.clipboard.writeText(joinUrl);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${roomId}`
    : '';

  // Show loading while checking for existing session
  if (checkingSession) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Checking session...</div>
        </div>
      </div>
    );
  }

  // Show lobby if player is already in the room
  if (inLobby) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Game Lobby</h1>
          <p className={styles.subtitle}>Room: {roomId}</p>

          {isHost && (
            <>
              <div className={styles.roomCode}>
                <div className={styles.codeLabel}>Room Code</div>
                <div className={styles.code} data-testid="room-code">{roomId}</div>
              </div>

              <div data-testid="join-qr-code" className={styles.qrSection}>
                <QRCodeSVG value={joinUrl} size={200} level="H"/>
                <p className={styles.qrHint}>Scan to join</p>
              </div>

              <div className={styles.urlSection}>
                <input
                  type="text"
                  value={joinUrl}
                  readOnly
                  className={styles.urlInput}
                />
                <button onClick={handleCopyLink} className={styles.copyButton}>
                  Copy Link
                </button>
              </div>
            </>
          )}

          {!isHost && (
            <div className={styles.playerCard}>
              <div className={styles.playerLabel}>You are</div>
              <div data-testid="player-name-display" className={styles.playerNameDisplay}>
                {currentPlayerName}
              </div>
            </div>
          )}

          <div className={styles.playersSection}>
            <h2 className={styles.playersTitle}>
              Players in Room ({players.length})
            </h2>
            {players.length === 0 ? (
              <p className={styles.noPlayers}>Loading players...</p>
            ) : (
              <div className={styles.playersList}>
                {players.map((player, index) => (
                  <div key={index} className={styles.playerItem}>
                    <span className={styles.playerNumber}>{index + 1}</span>
                    <span className={styles.playerName} data-testid="player-name">
                      {player}
                      {index === 0 && (
                        <span className={styles.hostBadge}> (Host)</span>
                      )}
                      {player === currentPlayerName && (
                        <span className={styles.youBadge}> (You)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {isHost ? (
            <div className={styles.hostControls}>
              <button
                onClick={handleStartGame}
                disabled={loading || players.length < 3}
                className={styles.startButton}
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
              {players.length < 3 && (
                <p className={styles.minPlayersWarning}>
                  Minimum 3 players required
                </p>
              )}
            </div>
          ) : (
            <div className={styles.waitingInfo}>
              <div className={styles.spinner}></div>
              <p>Waiting for host to start the game...</p>
            </div>
          )}

          <button onClick={handleLeave} className={styles.leaveButton}>
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // Show join form for new players
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Join Game</h1>
        <p className={styles.subtitle}>Room: {roomId}</p>

        <div className={styles.formSection}>
          <label className={styles.label}>Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter your name"
            className={styles.input}
            autoFocus
          />

          {error && <div className={styles.error}>{error}</div>}

          <button
            onClick={handleJoin}
            disabled={loading || !playerName.trim()}
            className={styles.joinButton}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>

        <div className={styles.hint}>
          <p>Enter your name to join this game</p>
          <p>The host will start the game when everyone has joined</p>
        </div>
      </div>
    </div>
  );
}
