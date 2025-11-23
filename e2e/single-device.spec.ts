import {expect, test} from '@playwright/test';
import {clearSession, revealAllRoles, setupSingleDeviceGame} from './test-helpers';
import {GAME_SETTINGS, TEST_PLAYERS} from './fixtures';

test.describe('Single Device Mode - Complete Game Flow', () => {
  test.beforeEach(async ({page}) => {
    await clearSession(page);
  });

  test('should complete a full game from setup to results', async ({page}) => {
    // Setup game with 3 players
    await setupSingleDeviceGame(page, TEST_PLAYERS.threePlayer, {
      categories: GAME_SETTINGS.minimal.categories,
      difficulty: GAME_SETTINGS.minimal.difficulty,
      timer: GAME_SETTINGS.minimal.timer,
    });

    // Should transition to reveal phase
    await expect(page.getByText('Pass the device to')).toBeVisible({timeout: 10000});

    // Go through role reveal for all players
    await revealAllRoles(page, TEST_PLAYERS.threePlayer.length);

    // Start timer
    await page.getByRole('button', {name: /start timer/i}).click()

    // Should transition to playing phase
    await expect(page.getByText(/game in progress/i)).toBeVisible({timeout: 10000});

    // Verify timer is showing
    const timerElement = page.locator('text=/\\d+:\\d+/');
    await expect(timerElement).toBeVisible();

    // Go to next phase (Skip timer)
    await page.getByRole('button', {name: /skip|end|finish/i}).click();

    // Check if voting phase appears
    await expect(page.getByText(/time to vote/i)).toBeVisible({timeout: 10000});

    // Vote for the first player (could be anyone)
    const firstPlayer = TEST_PLAYERS.threePlayer[0];
    await page.getByTestId(`vote-player-${firstPlayer}`).click();

    // Should transition to results
    await expect(page.getByText(/wins?|game over|winner/i)).toBeVisible({timeout: 10000});

    // Verify results page shows:
    // - Winner declaration
    await expect(page.getByText(/spy wins|non-spies win/i)).toBeVisible();

    // - The spy's name
    await expect(page.getByText(/the spy/i).first()).toBeVisible();

    // - Secret word
    await expect(page.getByText(/secret word/i)).toBeVisible();

    // - Play again button
    const playAgainButton = page.getByRole('button', {name: /play again/i});
    await expect(playAgainButton).toBeVisible();

    // Click play again
    await playAgainButton.click();

    // Should return to setup screen
    await expect(page.getByText('Setup your game')).toBeVisible({timeout: 10000});
  });

  test('should handle voting for the correct spy', async ({page}) => {
    // Setup and play through to voting
    await setupSingleDeviceGame(page, TEST_PLAYERS.threePlayer, {
      categories: ['locations'],
      difficulty: 'easy',
      timer: 5,
    });

    await expect(page.getByText('Pass the device to')).toBeVisible({timeout: 10000});
    await revealAllRoles(page, TEST_PLAYERS.threePlayer.length);

    // Start timer & Go to voting phase (Skip timer)
    await page.getByRole('button', {name: /start timer/i}).click();
    await page.getByRole('button', {name: /skip|end|finish/i}).click();

    // Wait for voting phase
    await expect(page.getByText(/time to vote/i)).toBeVisible({timeout: 10000});

    // In a real scenario, we'd need to know who the spy is
    // For this test, we'll just verify the voting mechanism works
    // Vote for second player
    const secondPlayer = TEST_PLAYERS.threePlayer[1];
    await page.getByTestId(`vote-player-${secondPlayer}`).click();

    // Should show results
    await expect(page.getByText(/wins?/i)).toBeVisible({timeout: 10000});
  });

  test('should allow spy to guess the word', async ({page}) => {
    // Setup and play through to voting
    await setupSingleDeviceGame(page, TEST_PLAYERS.fourPlayer, {
      categories: ['locations'],
      difficulty: 'easy',
      timer: 5,
    });

    await expect(page.getByText('Pass the device to')).toBeVisible({timeout: 10000});
    await revealAllRoles(page, TEST_PLAYERS.fourPlayer.length);

    // Start timer & Go to voting phase (Skip timer)
    await page.getByRole('button', {name: /start timer/i}).click();
    await page.getByRole('button', {name: /skip|end|finish/i}).click();

    // Wait for voting phase
    await expect(page.getByText(/time to vote/i)).toBeVisible({timeout: 10000});

    // Click "Let the Spy Guess the Word" button
    const spyGuessButton = page.getByRole('button', {name: /let the spy guess/i});
    await spyGuessButton.click();

    // Should show word options
    await expect(page.getByText(/pick the word/i)).toBeVisible({timeout: 5000});

    // Click on any word
    const wordButton = page.getByTestId('spy-guess-word').first();
    await expect(wordButton).toBeVisible();
    await wordButton.click();

    // Should show results
    await expect(page.getByText(/wins?/i)).toBeVisible({timeout: 10000});
  });

  test('should validate minimum player requirement', async ({page}) => {
    await page.goto('/');
    await page.getByRole('button', {name: /single device/i}).click();

    // Try to start with only 2 players
    const inputs = page.locator('input[placeholder^="Player"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');
    await inputs.nth(2).clear(); // Clear third player
    await inputs.nth(3).clear(); // Clear fourth player

    // Start button should be disabled or warning should appear
    const startButton = page.getByRole('button', {name: 'Start Game'});

    // Check if button is disabled
    const isDisabled = await startButton.isDisabled();
    expect(isDisabled).toBeTruthy();

    // Should show warning message
    await expect(page.getByText(/minimum 3 players/i)).toBeVisible();
  });
});
