'use client';

import { useEffect, useState } from 'react';
import { useGame } from './contexts/GameContext';
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import TimerScreen from './components/TimerScreen';
import EndGameScreen from './components/EndGameScreen';
import WaitingRoom from './components/WaitingRoom';
import { getPlayerSession } from './utils/playerSession';

export default function Home() {
  const { phase } = useGame();
  const [isPlayer, setIsPlayer] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const session = getPlayerSession();
    if (session && !session.isHost) {
      setIsPlayer(true);
    }
    setIsChecking(false);
  }, []);

  // Show loading state while checking session
  if (isChecking) {
    return null;
  }

  // If user is a joined player, show waiting room
  if (isPlayer) {
    return <WaitingRoom />;
  }

  // Otherwise, show normal game flow
  return (
    <>
      {phase === 'setup' && <SetupScreen />}
      {phase === 'reveal' && <RevealScreen />}
      {phase === 'playing' && <TimerScreen />}
      {(phase === 'voting' || phase === 'results') && <EndGameScreen />}
    </>
  );
}
