'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState, GameActions, Player, Language, GameMode, Category, Difficulty } from '../types/game';
import { getRandomWord } from '../data/words';

interface GameContextType extends GameState, GameActions {}

const GameContext = createContext<GameContextType | undefined>(undefined);

const ALL_CATEGORIES: Category[] = [
  'locations', 'food', 'drinks', 'animals', 'sports',
  'professions', 'countries', 'movies', 'music', 'brands',
  'party', 'celebrities', 'objects', 'hobbies', 'internet'
];

const initialState: GameState = {
  phase: 'setup',
  mode: 'single-device',
  roomId: null,
  players: [],
  secretWord: null,
  spyId: null,
  currentRevealIndex: 0,
  timerDuration: 8,
  includeRoles: false,
  language: 'en',
  selectedCategories: ALL_CATEGORIES,
  selectedDifficulty: 'medium',
  gameStartTime: null,
  votedSpyId: null,
  spyGuessedWord: null,
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

  const setCategories = (categories: Category[]) => {
    setState((prev) => ({
      ...prev,
      selectedCategories: categories,
    }));
  };

  const setDifficulty = (difficulty: Difficulty) => {
    setState((prev) => ({
      ...prev,
      selectedDifficulty: difficulty,
    }));
  };

  const setMode = (mode: GameMode) => {
    setState((prev) => ({
      ...prev,
      mode,
    }));
  };

  const setRoomId = (roomId: string) => {
    setState((prev) => ({
      ...prev,
      roomId,
    }));
  };

  const startGame = () => {
    setState((prev) => {
      // Randomly select a spy
      const randomSpyIndex = Math.floor(Math.random() * prev.players.length);

      // Select a random word based on selected categories and difficulty
      const word = getRandomWord(prev.selectedCategories, prev.selectedDifficulty);

      // Assign roles to players if includeRoles is true AND roles exist (locations only)
      const usedRoles: string[] = [];
      const updatedPlayers = prev.players.map((player, index) => {
        let role: string | undefined;

        if (prev.includeRoles && index !== randomSpyIndex && word && word.roles) {
          // Assign a unique role to non-spy players
          const availableRoles = word.roles.filter(r => !usedRoles.includes(r));
          if (availableRoles.length > 0) {
            role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
            usedRoles.push(role);
          } else {
            // If all roles are used, pick a random one
            role = word.roles[Math.floor(Math.random() * word.roles.length)];
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
        secretWord: word,
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

  const spyGuessWord = (wordName: string) => {
    setState((prev) => ({
      ...prev,
      phase: 'results',
      spyGuessedWord: wordName,
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
    setCategories,
    setDifficulty,
    setMode,
    setRoomId,
    startGame,
    nextReveal,
    startTimer,
    endGame,
    voteForSpy,
    spyGuessWord,
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
