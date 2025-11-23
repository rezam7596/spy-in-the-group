import {expect, test} from '@playwright/test';
import {clearSession, waitForPolling} from './test-helpers';
import {POLLING_TIMEOUT, TEST_PLAYERS} from './fixtures';

test.describe('Multi-Device Mode - Complete Game Flow', () => {
  test('should complete full game flow with host and 2 players', async ({browser}) => {
    // Create 3 separate browser contexts (3 devices)
    const hostContext = await browser.newContext();
    const player2Context = await browser.newContext();
    const player3Context = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const player2Page = await player2Context.newPage();
    const player3Page = await player3Context.newPage();

    try {
      // Clear sessions for all players
      await clearSession(hostPage);
      await clearSession(player2Page);
      await clearSession(player3Page);

      // Host creates a room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi-device|multi device/i}).click();

      // Enter host name
      await hostPage.getByPlaceholder(/name/i).fill(TEST_PLAYERS.threePlayer[0]);

      // Configure minimal settings for faster test
      await hostPage.getByRole('button', {name: '5 min'}).click();

      // Create room
      await hostPage.getByRole('button', {name: /create room/i}).click();

      // Wait for lobby to appear
      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Extract room ID from URL
      const hostUrl = hostPage.url();
      const roomIdMatch = hostUrl.match(/join\/([a-zA-Z0-9]+)/);
      expect(roomIdMatch).not.toBeNull();
      const roomId = roomIdMatch![1];

      // Verify host sees room code
      await expect(hostPage.getByText('Room Code')).toBeVisible();
      await expect(hostPage.getByText(roomId).first()).toBeVisible();

      // Player 2 joins
      await player2Page.goto(`/join/${roomId}`);
      await player2Page.getByPlaceholder(/name/i).fill(TEST_PLAYERS.threePlayer[1]);
      await player2Page.getByRole('button', {name: /join/i}).click();

      // Wait for player 2 to see lobby
      await expect(player2Page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player2Page.getByText(/waiting/i)).toBeVisible({timeout: POLLING_TIMEOUT});

      // Player 3 joins
      await player3Page.goto(`/join/${roomId}`);
      await player3Page.getByPlaceholder(/name/i).fill(TEST_PLAYERS.threePlayer[2]);
      await player3Page.getByRole('button', {name: /join/i}).click();

      // Wait for player 3 to see lobby
      await expect(player3Page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player3Page.getByText(/waiting/i)).toBeVisible({timeout: POLLING_TIMEOUT});

      // Wait for polling to update player list on host's page
      await waitForPolling(hostPage, 2);

      // Verify all 3 players appear in host's lobby
      await expect(hostPage.getByText(`Players in Room (3)`)).toBeVisible();
      await expect(hostPage.getByText(TEST_PLAYERS.threePlayer[0])).toBeVisible();
      await expect(hostPage.getByText(TEST_PLAYERS.threePlayer[1])).toBeVisible();
      await expect(hostPage.getByText(TEST_PLAYERS.threePlayer[2])).toBeVisible();

      // Host starts the game
      const startButton = hostPage.getByRole('button', {name: /start game/i});
      await expect(startButton).toBeEnabled();
      await startButton.click();

      // All players should see role reveal page
      await expect(hostPage.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player2Page.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player3Page.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Each player confirms their role
      await hostPage.getByRole('button', {name: /i got it/i}).click();
      await player2Page.getByRole('button', {name: /i got it/i}).click();
      await player3Page.getByRole('button', {name: /i got it/i}).click();

      // Wait for all confirmations and transition to timer
      await expect(hostPage.getByText(/time remaining|discussion time/i)).toBeVisible({
        timeout: POLLING_TIMEOUT,
      });
      await expect(player2Page.getByText(/time remaining|discussion time/i)).toBeVisible({
        timeout: POLLING_TIMEOUT,
      });
      await expect(player3Page.getByText(/time remaining|discussion time/i)).toBeVisible({
        timeout: POLLING_TIMEOUT,
      });

      // Wait a bit for gameplay (or look for a way to skip)
      await hostPage.waitForTimeout(3000);

      // In multi-device mode, host can start voting early
      // Look for "Start Voting" button on host page
      const startVotingButton = hostPage.getByRole('button', {name: /start voting/i});
      if (await startVotingButton.isVisible({timeout: 2000}).catch(() => false)) {
        await startVotingButton.click();
      } else {
        // Wait for timer to expire (5 minutes is too long, so this test assumes there's a way to skip)
        // For now, we'll wait for voting phase with a long timeout
        await expect(hostPage.getByText(/vote for the spy/i)).toBeVisible({timeout: 120000});
      }

      // All players should see voting page
      await expect(hostPage.getByText(/vote for the spy/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player2Page.getByText(/vote for the spy/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player3Page.getByText(/vote for the spy/i)).toBeVisible({timeout: POLLING_TIMEOUT});

      // Each player votes (vote for different players for variety)
      // Each player will vote for the first available option (not themselves)
      // Host votes for player 2 (Bob)
      await hostPage.getByTestId(`vote-player-${TEST_PLAYERS.threePlayer[1]}`).click();
      await hostPage.getByRole('button', {name: /submit vote/i}).click();

      // Player 2 votes for host (Alice)
      await player2Page.getByTestId(`vote-player-${TEST_PLAYERS.threePlayer[0]}`).click();
      await player2Page.getByRole('button', {name: /submit vote/i}).click();

      // Player 3 votes for host (Alice)
      await player3Page.getByTestId(`vote-player-${TEST_PLAYERS.threePlayer[0]}`).click();
      await player3Page.getByRole('button', {name: /submit vote/i}).click();

      // Wait for results page
      await expect(hostPage.getByText(/wins?|winner/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player2Page.getByText(/wins?|winner/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player3Page.getByText(/wins?|winner/i)).toBeVisible({timeout: POLLING_TIMEOUT});

      // Verify results show on all devices
      await expect(hostPage.getByText(/spy wins|non-spies win/i)).toBeVisible();
      await expect(player2Page.getByText(/spy wins|non-spies win/i)).toBeVisible();
      await expect(player3Page.getByText(/spy wins|non-spies win/i)).toBeVisible();

      // Host can restart the game
      const restartButton = hostPage.getByRole('button', {name: /new game/i});
      await restartButton.click();

      // Should return to lobby
      for (const page of [hostPage, player2Page, player2Page]) {
        await expect(page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      }

      // Players should still be in the room
      for (const playerName of TEST_PLAYERS.threePlayer) {
        await expect(hostPage.getByText(playerName)).toBeVisible();
      }
    } finally {
      // Cleanup
      await hostContext.close();
      await player2Context.close();
      await player3Context.close();
    }
  });

  test('should handle player joining and viewing lobby correctly', async ({browser}) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    try {
      await clearSession(hostPage);
      await clearSession(playerPage);

      // Host creates room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // Player joins
      await playerPage.goto(`/join/${roomId}`);
      await expect(playerPage.getByRole('heading', {name: 'Join Game'})).toBeVisible();
      await expect(playerPage.getByText(`Room: ${roomId}`)).toBeVisible();

      await playerPage.getByPlaceholder(/name/i).fill('Player1');
      await playerPage.getByRole('button', {name: /join/i}).click();

      // Both should see lobby with both players
      await waitForPolling(hostPage, 2);

      await expect(hostPage.getByText('Players in Room (2)')).toBeVisible();
      await expect(hostPage.getByText('Host')).toBeVisible();
      await expect(hostPage.getByText('Player1')).toBeVisible();

      await expect(playerPage.getByText('Players in Room (2)')).toBeVisible();
      await expect(playerPage.getByText(/waiting for host/i)).toBeVisible();

      // Verify player sees "You are" indicator
      await expect(playerPage.getByText('You are')).toBeVisible();
      await expect(playerPage.getByTestId('player-name-display').filter({hasText: 'Player1'})).toBeVisible();

      // Verify host sees QR code and can copy link
      await expect(hostPage.getByRole('button', {name: /copy link/i})).toBeVisible();
      await expect(hostPage.getByTestId('join-qr-code').locator('svg')).toBeVisible();
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('should enforce minimum 3 players before starting', async ({browser}) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    try {
      await clearSession(hostPage);

      // Host creates room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      // With only 1 player (host), start button should be disabled
      const startButton = hostPage.getByRole('button', {name: /start game/i});
      await expect(startButton).toBeDisabled();

      // Should show warning
      await expect(hostPage.getByText(/minimum 3 players/i)).toBeVisible();
    } finally {
      await hostContext.close();
    }
  });

  test('should maintain session across page refresh', async ({browser}) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    try {
      await clearSession(hostPage);

      // Host creates room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // Refresh the page
      await hostPage.reload();

      // Should still be in the lobby
      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(hostPage.getByText(`Room: ${roomId}`)).toBeVisible();
      await expect(hostPage.getByText('Host')).toBeVisible();
    } finally {
      await hostContext.close();
    }
  });
});
