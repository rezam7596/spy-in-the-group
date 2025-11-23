import { Page, expect } from '@playwright/test';
import { POLLING_INTERVAL, POLLING_TIMEOUT } from './fixtures';

/**
 * Wait for polling cycle to complete
 * Most screens poll every 2 seconds for updates
 */
export async function waitForPolling(page: Page, cycles = 1) {
  await page.waitForTimeout(POLLING_INTERVAL * cycles + 500);
}

/**
 * Setup game for single-device mode
 */
export async function setupSingleDeviceGame(
  page: Page,
  players: string[],
  options?: {
    categories?: string[];
    language?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    timer?: number;
    roles?: boolean;
  }
) {
  // Navigate to home page
  await page.goto('/');

  // Select single-device mode
  await page.getByRole('button', { name: /single device/i }).click();

  // Wait for setup screen
  await expect(page.getByText('Setup your game')).toBeVisible();

  // Fill in player names in the existing input fields
  const inputs = page.locator('input[placeholder^="Player"]');
  const inputCount = await inputs.count();

  for (let i = 0; i < Math.min(players.length, inputCount); i++) {
    await inputs.nth(i).fill(players[i]);
  }

  // Add more players if needed
  for (let i = inputCount; i < players.length; i++) {
    await page.getByRole('button', { name: '+ Add Player' }).click();
    const newInput = page.locator('input[placeholder^="Player"]').nth(i);
    await newInput.fill(players[i]);
  }

  // Select categories if provided (buttons with category names)
  if (options?.categories) {
    // First, show all categories
    const showMoreButton = page.getByTestId('show-more-categories');
    if (await showMoreButton.isVisible()) {
      await showMoreButton.click();
    }

    // Deselect all first if we want specific categories
    const selectAllButton = page.getByRole('button', { name: /✓ All|Select All/i });
    const buttonText = await selectAllButton.textContent();
    if (buttonText?.includes('✓ All')) {
      await selectAllButton.click(); // This will deselect all except locations
    }

    // Now select the desired categories
    for (const category of options.categories) {
      const categoryButton = page.getByTestId(`category-${category}`);
      const isActive = await categoryButton.getAttribute('data-active');
      if (isActive !== 'true') {
        await categoryButton.click();
      }
    }
  }

  // Select difficulty if provided
  if (options?.difficulty) {
    const diffName = options.difficulty.charAt(0).toUpperCase() + options.difficulty.slice(1);
    await page.getByRole('button', { name: new RegExp(diffName, 'i') }).click();
  }

  // Select language if provided
  if (options?.language) {
    const languageMap: Record<string, string> = {
      en: 'English',
      fa: 'فارسی',
      sv: 'Svenska',
      zh: '中文',
      hi: 'हिन्दी',
      es: 'Español',
      fr: 'Français',
      ar: 'العربية',
    };
    const langName = languageMap[options.language];
    if (langName) {
      // Show all languages first
      const showMoreLangButton = page.getByTestId('show-more-languages');
      if (await showMoreLangButton.isVisible()) {
        await showMoreLangButton.click();
      }
      await page.getByRole('button', { name: new RegExp(langName) }).click();
    }
  }

  // Select timer if provided
  if (options?.timer) {
    await page.getByRole('button', { name: `${options.timer} min` }).click();
  }

  // Start game
  await page.getByRole('button', { name: 'Start Game' }).click();
}

/**
 * Go through role reveal for all players in single-device mode
 */
export async function revealAllRoles(page: Page, playerCount: number) {
  for (let i = 0; i < playerCount; i++) {
    // Wait for "Pass the device to" message
    await expect(page.getByText('Pass the device to')).toBeVisible();

    // Click "I'm Ready" button
    await page.getByRole('button', { name: "I'm Ready" }).click();

    // Should see either "You are the SPY!" or "You are NOT the spy"
    await expect(
      page.getByText(/You are the SPY!|You are NOT the spy/i)
    ).toBeVisible({ timeout: 5000 });

    // Click "Got it!" button
    await page.getByRole('button', { name: 'Got it!' }).click();
  }
}

/**
 * Create a room for multi-device mode
 */
export async function createRoom(
  page: Page,
  hostName: string,
  options?: {
    categories?: string[];
    language?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    timer?: number;
  }
) {
  // Navigate to home and select multi-device mode
  await page.goto('/');
  await page.getByRole('button', { name: /multi-device|online/i }).click();

  // Enter host name
  await page.getByPlaceholder(/name/i).fill(hostName);

  // Configure settings if provided
  if (options?.categories) {
    for (const category of options.categories) {
      const checkbox = page.locator(`input[value="${category}"]`);
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.check();
      }
    }
  }

  if (options?.language) {
    await page.locator('select').first().selectOption(options.language);
  }

  if (options?.difficulty) {
    await page.getByLabel(options.difficulty, { exact: true }).check();
  }

  if (options?.timer) {
    await page.locator('select').nth(1).selectOption(options.timer.toString());
  }

  // Create room
  await page.getByRole('button', { name: /create room/i }).click();

  // Wait for room to be created (should see room code)
  await expect(page.getByText(/room code|join code/i)).toBeVisible({
    timeout: POLLING_TIMEOUT,
  });

  // Extract room code from URL or page
  const url = page.url();
  const roomIdMatch = url.match(/join\/([a-zA-Z0-9]+)/);
  if (!roomIdMatch) {
    throw new Error('Could not extract room ID from URL');
  }

  return roomIdMatch[1];
}

/**
 * Join a room as a player
 */
export async function joinRoom(page: Page, roomId: string, playerName: string) {
  await page.goto(`/join/${roomId}`);

  // Enter player name
  await page.getByPlaceholder(/name/i).fill(playerName);
  await page.getByRole('button', { name: /join/i }).click();

  // Wait for lobby/waiting room
  await expect(page.getByText(/waiting|lobby/i)).toBeVisible({
    timeout: POLLING_TIMEOUT,
  });
}

/**
 * Wait for game phase to change
 */
export async function waitForPhase(
  page: Page,
  phase: 'reveal' | 'playing' | 'voting' | 'results',
  timeout = POLLING_TIMEOUT
) {
  const selectors = {
    reveal: /reveal your role|tap to reveal/i,
    playing: /time remaining|timer|discussion/i,
    voting: /vote for|cast your vote/i,
    results: /results|game over|winner/i,
  };

  await expect(page.getByText(selectors[phase])).toBeVisible({ timeout });
}

/**
 * Clear localStorage and cookies
 */
export async function clearSession(page: Page) {
  // Navigate to the base URL first to ensure localStorage is accessible
  try {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // If navigation or evaluation fails, just clear cookies
    console.log('Could not clear localStorage/sessionStorage:', error);
  }
  await page.context().clearCookies();
}

/**
 * Get player list from lobby
 */
export async function getPlayerList(page: Page): Promise<string[]> {
  const players = await page.getByTestId('player-name').allTextContents();
  return players;
}

/**
 * Vote for a player in multi-device mode
 */
export async function voteForPlayer(page: Page, playerName: string) {
  await page.getByRole('button', { name: new RegExp(playerName, 'i') }).click();
  await page.getByRole('button', { name: /confirm|submit vote/i }).click();
}

/**
 * Extract room code from page
 */
export async function getRoomCode(page: Page): Promise<string> {
  const codeElement = await page.getByTestId('room-code').textContent();
  if (!codeElement) {
    throw new Error('Could not find room code on page');
  }
  return codeElement.trim();
}
