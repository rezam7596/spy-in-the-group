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

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
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
  };

  const handlePlayAgain = () => {
    clearPlayerSession();
    router.push('/');
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

        <button onClick={handlePlayAgain} className={styles.playAgainButton}>
          Play Again
        </button>
      </div>
    </div>
  );
}
