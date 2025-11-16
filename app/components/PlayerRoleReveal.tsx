'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerSession } from '../utils/playerSession';
import { Location, Language } from '../types/game';
import styles from './PlayerRoleReveal.module.css';

interface PlayerRoleData {
  playerName: string;
  isSpy: boolean;
  role?: string;
  location?: Location | null;
  hasConfirmed: boolean;
  gamePhase?: string;
}

interface PlayerRoleRevealProps {
  roomId: string;
  language: Language;
}

export default function PlayerRoleReveal({ roomId, language }: PlayerRoleRevealProps) {
  const router = useRouter();
  const [roleData, setRoleData] = useState<PlayerRoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchPlayerRole();
  }, []);

  useEffect(() => {
    if (!roleData || roleData.hasConfirmed) {
      // Poll for game phase changes
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/rooms/${roomId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.room.gamePhase === 'timer') {
              // All players confirmed, move to timer view
              router.push('/timer');
            }
          }
        } catch (err) {
          console.error('Failed to check game phase:', err);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [roleData, roomId, router]);

  const fetchPlayerRole = async () => {
    try {
      const session = getPlayerSession();
      if (!session) {
        router.push('/');
        return;
      }

      const response = await fetch(`/api/rooms/${roomId}/player-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: session.playerName }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch role');
      }

      const data = await response.json();
      setRoleData(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load your role. Please try again.');
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!roleData) return;

    try {
      setConfirming(true);
      const session = getPlayerSession();

      const response = await fetch(`/api/rooms/${roomId}/confirm-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: session?.playerName }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm role');
      }

      const data = await response.json();
      setRoleData(prev => prev ? { ...prev, hasConfirmed: true } : null);

      if (data.allConfirmed) {
        // All players confirmed, redirect to timer
        router.push('/timer');
      }
    } catch (err) {
      setError('Failed to confirm. Please try again.');
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading your role...</div>
        </div>
      </div>
    );
  }

  if (error || !roleData) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>{error || 'Failed to load role'}</div>
        </div>
      </div>
    );
  }

  const locationName = roleData.location?.name[language] || '';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Your Role</h1>

        {roleData.isSpy ? (
          <div className={styles.spyCard}>
            <div className={styles.spyIcon}>🕵️</div>
            <h2 className={styles.spyTitle}>You are the SPY!</h2>
            <p className={styles.spyText}>
              You don&apos;t know the location. Try to figure it out by asking questions
              without revealing that you&apos;re the spy!
            </p>
          </div>
        ) : (
          <div className={styles.regularCard}>
            <div className={styles.locationSection}>
              <div className={styles.locationLabel}>The Location</div>
              <div className={styles.locationName}>{locationName}</div>
            </div>

            {roleData.role && (
              <div className={styles.roleSection}>
                <div className={styles.roleLabel}>Your Role</div>
                <div className={styles.roleName}>{roleData.role}</div>
              </div>
            )}

            <div className={styles.instructions}>
              <p>Remember this information!</p>
              <p>Try to find the spy without giving away the location.</p>
            </div>
          </div>
        )}

        {!roleData.hasConfirmed ? (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className={styles.confirmButton}
          >
            {confirming ? 'Confirming...' : 'I Got It!'}
          </button>
        ) : (
          <div className={styles.waitingSection}>
            <div className={styles.spinner}></div>
            <p className={styles.waitingText}>
              Waiting for other players to confirm...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
