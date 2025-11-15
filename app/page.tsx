'use client';

import { useGame } from './contexts/GameContext';
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import TimerScreen from './components/TimerScreen';
import EndGameScreen from './components/EndGameScreen';

export default function Home() {
  const { phase } = useGame();

  return (
    <>
      {phase === 'setup' && <SetupScreen />}
      {phase === 'reveal' && <RevealScreen />}
      {phase === 'playing' && <TimerScreen />}
      {(phase === 'voting' || phase === 'results') && <EndGameScreen />}
    </>
  );
}
