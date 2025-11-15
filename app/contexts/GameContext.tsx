'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState, GameActions, Player, Language } from '../types/game';
import { getRandomLocation } from '../data/locations';

interface GameContextType extends GameState, GameActions {}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameState = {
  phase: 'setup',
  players: [],
  secretLocation: null,
  spyId: null,
  currentRevealIndex: 0,
  timerDuration: 8,
  includeRoles: false,
  language: 'en',
  gameStartTime: null,
  votedSpyId: null,
  spyGuessedLocation: null,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);

  const setPlayers = (names: string[]) => {
    const players: Player[] = names.map((name, index) => ({
      id: `player-${index}`,
      name,
      isSpy: false,
      hasSeenRole: false,
    }));

    setState((prev) => ({
      ...prev,
      players,
    }));
  };

  const setTimerDuration = (minutes: number) => {
    setState((prev) => ({
      ...prev,
      timerDuration: minutes,
    }));
  };

  const setIncludeRoles = (include: boolean) => {
    setState((prev) => ({
      ...prev,
      includeRoles: include,
    }));
  };

  const setLanguage = (language: Language) => {
    setState((prev) => ({
      ...prev,
      language,
    }));
  };

  const startGame = () => {
    setState((prev) => {
      // Randomly select a spy
      const randomSpyIndex = Math.floor(Math.random() * prev.players.length);

      // Select a random location
      const location = getRandomLocation();

      // Assign roles to players if includeRoles is true
      const usedRoles: string[] = [];
      const updatedPlayers = prev.players.map((player, index) => {
        let role: string | undefined;

        if (prev.includeRoles && index !== randomSpyIndex && location) {
          // Assign a unique role to non-spy players
          const availableRoles = location.roles.filter(r => !usedRoles.includes(r));
          if (availableRoles.length > 0) {
            role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
            usedRoles.push(role);
          } else {
            // If all roles are used, pick a random one
            role = location.roles[Math.floor(Math.random() * location.roles.length)];
          }
        }

        return {
          ...player,
          isSpy: index === randomSpyIndex,
          role,
        };
      });

      return {
        ...prev,
        phase: 'reveal',
        players: updatedPlayers,
        secretLocation: location,
        spyId: updatedPlayers[randomSpyIndex].id,
        currentRevealIndex: 0,
      };
    });
  };

  const nextReveal = () => {
    const nextIndex = state.currentRevealIndex + 1;

    // Mark current player as having seen their role
    const updatedPlayers = state.players.map((player, index) =>
      index === state.currentRevealIndex
        ? { ...player, hasSeenRole: true }
        : player
    );

    if (nextIndex >= state.players.length) {
      // All players have seen their roles, move to playing phase
      setState((prev) => ({
        ...prev,
        phase: 'playing',
        players: updatedPlayers,
        currentRevealIndex: nextIndex,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        players: updatedPlayers,
        currentRevealIndex: nextIndex,
      }));
    }
  };

  const startTimer = () => {
    setState((prev) => ({
      ...prev,
      gameStartTime: Date.now(),
    }));
  };

  const endGame = () => {
    setState((prev) => ({
      ...prev,
      phase: 'voting',
    }));
  };

  const voteForSpy = (playerId: string) => {
    setState((prev) => ({
      ...prev,
      phase: 'results',
      votedSpyId: playerId,
    }));
  };

  const spyGuessLocation = (locationName: string) => {
    setState((prev) => ({
      ...prev,
      phase: 'results',
      spyGuessedLocation: locationName,
    }));
  };

  const resetGame = () => {
    setState(initialState);
  };

  const value: GameContextType = {
    ...state,
    setPlayers,
    setTimerDuration,
    setIncludeRoles,
    setLanguage,
    startGame,
    nextReveal,
    startTimer,
    endGame,
    voteForSpy,
    spyGuessLocation,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
