/**
 * Test fixtures and constants for e2e tests
 */

export const TEST_PLAYERS = {
  threePlayer: ['Alice', 'Bob', 'Charlie'],
  fourPlayer: ['Alice', 'Bob', 'Charlie', 'Diana'],
  tenPlayer: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hannah', 'Ian', 'Jack'],
};

export const GAME_SETTINGS = {
  default: {
    categories: ['locations', 'food'],
    language: 'en',
    difficulty: 'medium' as const,
    timer: 5,
  },
  minimal: {
    categories: ['locations'],
    language: 'en',
    difficulty: 'easy' as const,
    timer: 5,
  },
  advanced: {
    categories: ['locations', 'food', 'animals', 'objects'],
    language: 'en',
    difficulty: 'hard' as const,
    timer: 10,
  },
};

export const POLLING_INTERVAL = 2000; // 2 seconds
export const POLLING_TIMEOUT = 10000; // 10 seconds

export const CATEGORIES = [
  'locations',
  'food',
  'animals',
  'objects',
  'sports',
  'professions',
  'hobbies',
  'movies',
  'music',
  'books',
  'brands',
  'countries',
  'celebrities',
  'technology',
  'words',
];

export const LANGUAGES = ['en', 'fa', 'sv', 'zh', 'hi', 'es', 'fr', 'ar'];

export const DIFFICULTIES = ['easy', 'medium', 'hard'];

export const TIMER_OPTIONS = [5, 6, 8, 10];
