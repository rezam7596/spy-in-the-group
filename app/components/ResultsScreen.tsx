'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerSession, clearPlayerSession } from '../utils/playerSession';
import { Language, Location, PlayerVote } from '../types/game';
import styles from './ResultsScreen.module.css';

interface ResultsScreenProps {
  roomId: string;
}

interface VoteCount {
  playerName: string;
  voteCount: number;
}

export default function ResultsScreen({ roomId }: ResultsScreenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [spyName, setSpyName] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [votes, setVotes] = useState<PlayerVote[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [mostVotedPlayer, setMostVotedPlayer] = useState<string>('');
  const [spyWon, setSpyWon] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          const room = data.room;

          // Find the spy
          const spyRole = room.playerRoles?.find((pr: any) => pr.isSpy);
          const spyPlayerName = spyRole?.playerName || '';

          // Calculate vote counts
          const voteCounts: { [key: string]: number } = {};
          room.players.forEach((p: string) => {
            voteCounts[p] = 0;
          });

          room.votes?.forEach((vote: PlayerVote) => {
            voteCounts[vote.votedForName] = (voteCounts[vote.votedForName] || 0) + 1;
          });

          // Find most voted player
          let maxVotes = 0;
          let mostVoted = '';
          Object.entries(voteCounts).forEach(([player, count]) => {
            if (count > maxVotes) {
              maxVotes = count;
              mostVoted = player;
            }
          });

          // Determine winner: spy wins if they weren't caught
          const spyWins = mostVoted !== spyPlayerName;

          setSpyName(spyPlayerName);
          setLocation(room.location);
          setLanguage(room.settings?.language || 'en');
          setVotes(room.votes || []);
          setPlayers(room.players);
          setMostVotedPlayer(mostVoted);
          setSpyWon(spyWins);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setLoading(false);
      }
    }
    fetchResults();

    // Check if current player is the host
    const session = getPlayerSession();
    if (session) {
      setIsHost(session.isHost);
    }
  }, []);

  // Poll for game phase changes (host restarting)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          const room = data.room;

          // If room goes back to waiting, redirect to lobby
          if (room.gamePhase === 'waiting') {
            clearInterval(interval);
            router.push(`/join/${roomId}`);
          }
        }
      } catch (err) {
        console.error('Failed to check room status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId, router]);

  const handlePlayAgain = () => {
    clearPlayerSession();
    router.push('/');
  };

  const handleRestart = async () => {
    const session = getPlayerSession();
    if (!session || !session.isHost) {
      return;
    }

    setRestarting(true);

    try {
      const response = await fetch(`/api/rooms/${roomId}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: session.playerId,
        }),
      });

      if (response.ok) {
        // Redirect to lobby - other players will be redirected via polling
        router.push(`/join/${roomId}`);
      } else {
        const data = await response.json();
        console.error('Failed to restart game:', data.error);
        setRestarting(false);
      }
    } catch (err) {
      console.error('Failed to restart game:', err);
      setRestarting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading results...</div>
        </div>
      </div>
    );
  }

  const locationName = location?.name[language] || 'Unknown';

  // Calculate vote counts for display
  const voteCounts = players.map(playerName => {
    const count = votes.filter(v => v.votedForName === playerName).length;
    return { playerName, voteCount: count };
  }).sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Game Over!</h1>

        <div className={spyWon ? styles.spyWinCard : styles.playersWinCard}>
          <div className={styles.winIcon}>{spyWon ? '🕵️' : '🎉'}</div>
          <h2 className={styles.winTitle}>
            {spyWon ? 'The Spy Wins!' : 'Players Win!'}
          </h2>
          <p className={styles.winText}>
            {spyWon
              ? `The spy ${spyName} escaped detection!`
              : `You caught the spy ${spyName}!`}
          </p>
        </div>

        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Game Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>The Spy Was</div>
              <div className={styles.infoValue}>{spyName}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>The Location Was</div>
              <div className={styles.infoValue}>{locationName}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Most Voted Player</div>
              <div className={styles.infoValue}>
                {mostVotedPlayer}
                {mostVotedPlayer === spyName && ' ✓'}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.votesSection}>
          <h3 className={styles.sectionTitle}>Vote Results</h3>
          <div className={styles.votesList}>
            {voteCounts.map(({ playerName, voteCount }) => (
              <div key={playerName} className={styles.voteItem}>
                <span className={styles.voteName}>
                  {playerName}
                  {playerName === spyName && (
                    <span className={styles.spyBadge}>SPY</span>
                  )}
                </span>
                <div className={styles.voteBar}>
                  <div
                    className={styles.voteBarFill}
                    style={{
                      width: `${(voteCount / players.length) * 100}%`,
                    }}
                  ></div>
                  <span className={styles.voteCount}>{voteCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <div className={styles.hostButtons}>
            <button
              onClick={handleRestart}
              disabled={restarting}
              className={styles.playAgainButton}
            >
              {restarting ? 'Starting New Game...' : 'New Game'}
            </button>
            <p className={styles.hostInfo}>
              Start a new game with the same players and a new location
            </p>
            <button
              onClick={handlePlayAgain}
              disabled={restarting}
              className={styles.endGameButton}
            >
              End Game
            </button>
            <p className={styles.hostInfo}>
              Return to setup and create a new room
            </p>
          </div>
        ) : (
          <div className={styles.waitingContainer}>
            <p className={styles.waitingText}>Waiting for host to start a new game...</p>
            <button onClick={handlePlayAgain} className={styles.leaveButton}>
              Leave Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
