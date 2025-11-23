import {expect, test} from '@playwright/test';
import {clearSession, waitForPolling} from './test-helpers';
import {POLLING_TIMEOUT} from './fixtures';

test.describe('Multi-Device Room Joining and Error Handling', () => {
  test('should successfully join a valid room', async ({browser}) => {
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
      await hostPage.getByPlaceholder(/name/i).fill('HostPlayer');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // Player joins with valid room code
      await playerPage.goto(`/join/${roomId}`);
      await expect(playerPage.getByRole('heading', {name: 'Join Game'})).toBeVisible();
      await expect(playerPage.getByText(`Room: ${roomId}`)).toBeVisible();

      await playerPage.getByPlaceholder(/name/i).fill('PlayerOne');
      await playerPage.getByRole('button', {name: /join/i}).click();

      // Should successfully join and see lobby
      await expect(playerPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(playerPage.getByText(/waiting/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(playerPage.getByTestId('player-name-display').filter({hasText: 'PlayerOne'})).toBeVisible();
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('should show error for invalid room code', async ({page}) => {
    await clearSession(page);

    // Try to join non-existent room
    await page.goto('/join/INVALIDCODE123');

    // Fill in name
    await page.getByPlaceholder(/name/i).fill('TestPlayer');
    await page.getByRole('button', {name: /join/i}).click();

    // Should show error message
    await expect(page.getByText(/failed to join|room not found|does not exist/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should prevent joining with empty name', async ({browser}) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    try {
      await clearSession(hostPage);
      await clearSession(playerPage);

      // Create room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // Try to join without entering name
      await playerPage.goto(`/join/${roomId}`);

      const joinButton = playerPage.getByRole('button', {name: /join/i});

      // Button should be disabled when name is empty
      await expect(joinButton).toBeDisabled();

      // Enter only spaces
      await playerPage.getByPlaceholder(/name/i).fill('   ');
      await expect(joinButton).toBeDisabled();

      // Enter valid name
      await playerPage.getByPlaceholder(/name/i).fill('ValidPlayer');
      await expect(joinButton).toBeEnabled();
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('should maintain player session after page refresh', async ({browser}) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    try {
      await clearSession(hostPage);
      await clearSession(playerPage);

      // Create room and join
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      await playerPage.goto(`/join/${roomId}`);
      await playerPage.getByPlaceholder(/name/i).fill('Player1');
      await playerPage.getByRole('button', {name: /join/i}).click();

      await expect(playerPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Refresh player page
      await playerPage.reload();

      // Should still be in the lobby without needing to rejoin
      await expect(playerPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(playerPage.getByTestId('player-name-display').filter({hasText: 'Player1'})).toBeVisible();
      await expect(playerPage.getByText(`Room: ${roomId}`)).toBeVisible();
      await expect(playerPage.getByText(/waiting/i)).toBeVisible({timeout: POLLING_TIMEOUT});
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('should allow player to leave and rejoin room', async ({browser}) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    try {
      await clearSession(hostPage);
      await clearSession(playerPage);

      // Create room and join
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      await playerPage.goto(`/join/${roomId}`);
      await playerPage.getByPlaceholder(/name/i).fill('Player1');
      await playerPage.getByRole('button', {name: /join/i}).click();

      await expect(playerPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Leave room
      const leaveButton = playerPage.getByRole('button', {name: /leave/i});
      await leaveButton.click();

      // Should return to home page
      await expect(playerPage.getByText('Spy in the Group')).toBeVisible({timeout: 5000});

      // Rejoin the same room
      await playerPage.goto(`/join/${roomId}`);
      await playerPage.getByPlaceholder(/name/i).fill('Player1Returning');
      await playerPage.getByRole('button', {name: /join/i}).click();

      // Should successfully rejoin
      await expect(playerPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(playerPage.getByTestId('player-name-display').filter({hasText: 'Player1Returning'})).toBeVisible();
      await expect(playerPage.getByText(/waiting/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      // Make sure no one with old name is present in the room
      await expect(playerPage.getByText('Player1', {exact: true})).not.toBeVisible();
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('should show QR code and copy link functionality for host', async ({page}) => {
    await clearSession(page);

    await page.goto('/');
    await page.getByRole('button', {name: /multi device/i}).click();
    await page.getByPlaceholder(/name/i).fill('Host');
    await page.getByRole('button', {name: /create room/i}).click();

    await expect(page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

    // Host should see QR code
    const qrCode = page.getByTestId('join-qr-code').locator('svg'); // QR code is rendered as SVG
    await expect(qrCode).toBeVisible();

    // Host should see copy link button
    const copyButton = page.getByRole('button', {name: /copy link/i});
    await expect(copyButton).toBeVisible();

    // Test copy functionality (we can't test clipboard directly in tests, but we can click it)
    await copyButton.click();

    // Verify URL input is visible with the join link
    const urlInput = page.locator('input[type="text"][readonly]');
    await expect(urlInput).toBeVisible();
    const urlValue = await urlInput.inputValue();
    expect(urlValue).toContain('/join/');
  });

  test('should handle duplicate player names', async ({browser}) => {
    const hostContext = await browser.newContext();
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
      await clearSession(hostPage);
      await clearSession(player1Page);
      await clearSession(player2Page);

      // Create room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // First player joins with name "Alice"
      await player1Page.goto(`/join/${roomId}`);
      await player1Page.getByPlaceholder(/name/i).fill('Alice');
      await player1Page.getByRole('button', {name: /join/i}).click();
      await expect(player1Page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Second player tries to join with same name "Alice"
      await player2Page.goto(`/join/${roomId}`);
      await player2Page.getByPlaceholder(/name/i).fill('Alice');
      await player2Page.getByRole('button', {name: /join/i}).click();

      // Depending on implementation, this might:
      // 1. Show an error (ideal)
      // 2. Allow it but append number
      // 3. Allow duplicate (not ideal but possible)

      // Wait and see what happens
      await player2Page.waitForTimeout(3000);

      // Check if either error is shown or player joined with modified name
      const hasError = await player2Page.getByText(/already exists|duplicate|taken/i).isVisible().catch(() => false);
      const inLobby = await player2Page.getByText('Game Lobby').isVisible().catch(() => false);
      let hasDifferentName;
      if (inLobby) {
        const player2Name = await player2Page.getByTestId('player-name-display').textContent().catch(() => false);
        hasDifferentName = player2Name && player2Name !== 'Alice';
      }

      // One of these should be true
      expect(hasError || inLobby && hasDifferentName).toBeTruthy();
    } finally {
      await hostContext.close();
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('should show room code clearly in lobby', async ({page}) => {
    await clearSession(page);

    await page.goto('/');
    await page.getByRole('button', {name: /multi device/i}).click();
    await page.getByPlaceholder(/name/i).fill('Host');
    await page.getByRole('button', {name: /create room/i}).click();

    await expect(page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

    // Extract room ID from URL
    const roomId = page.url().match(/join\/([a-zA-Z0-9]+)/)![1];

    // Verify room code is displayed prominently
    await expect(page.getByText('Room Code')).toBeVisible();
    await expect(page.getByTestId('room-code').getByText(roomId)).toBeVisible();

    // Verify room ID also appears in subtitle
    await expect(page.getByText(`Room: ${roomId}`)).toBeVisible();
  });

  test('should prevent joining after game has started', async ({browser}) => {
    const hostContext = await browser.newContext();
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    const latePlayerContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();
    const latePlayerPage = await latePlayerContext.newPage();

    try {
      await clearSession(hostPage);
      await clearSession(player1Page);
      await clearSession(player2Page);
      await clearSession(latePlayerPage);

      // Create room with 3 players
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // Two players join
      await player1Page.goto(`/join/${roomId}`);
      await player1Page.getByPlaceholder(/name/i).fill('Player1');
      await player1Page.getByRole('button', {name: /join/i}).click();

      await player2Page.goto(`/join/${roomId}`);
      await player2Page.getByPlaceholder(/name/i).fill('Player2');
      await player2Page.getByRole('button', {name: /join/i}).click();

      await waitForPolling(hostPage, 2);

      // Host starts the game
      const startButton = hostPage.getByRole('button', {name: /start game/i});
      await expect(startButton).toBeEnabled();
      await startButton.click();

      // Wait for game to start
      await expect(hostPage.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Late player tries to join
      await latePlayerPage.goto(`/join/${roomId}`);
      await latePlayerPage.getByPlaceholder(/name/i).fill('LatePlayer');
      await latePlayerPage.getByRole('button', {name: /join/i}).click();

      // Should show error that game already started
      await expect(latePlayerPage.getByText(/already started|has started|in progress/i)).toBeVisible({
        timeout: 10000,
      });
    } finally {
      await hostContext.close();
      await player1Context.close();
      await player2Context.close();
      await latePlayerContext.close();
    }
  });

  test('should show player count updates in real-time', async ({browser}) => {
    const hostContext = await browser.newContext();
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
      await clearSession(hostPage);
      await clearSession(player1Page);
      await clearSession(player2Page);

      // Create room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // Initially should show 1 player (host)
      await expect(hostPage.getByText('Players in Room (1)')).toBeVisible();

      // Player 1 joins
      await player1Page.goto(`/join/${roomId}`);
      await player1Page.getByPlaceholder(/name/i).fill('Player1');
      await player1Page.getByRole('button', {name: /join/i}).click();
      await expect(player1Page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Wait for polling cycle
      await waitForPolling(hostPage, 2);

      // Should show 2 players
      await expect(hostPage.getByText('Players in Room (2)')).toBeVisible();

      // Player 2 joins
      await player2Page.goto(`/join/${roomId}`);
      await player2Page.getByPlaceholder(/name/i).fill('Player2');
      await player2Page.getByRole('button', {name: /join/i}).click();
      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      await expect(player2Page.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});

      // Wait for polling cycle
      await waitForPolling(hostPage, 2);

      // Should show 3 players
      await expect(hostPage.getByText('Players in Room (3)')).toBeVisible();

      // All players' pages should show 3 players
      await expect(player1Page.getByText('Players in Room (3)')).toBeVisible();
      await expect(player2Page.getByText('Players in Room (3)')).toBeVisible();
    } finally {
      await hostContext.close();
      await player1Context.close();
      await player2Context.close();
    }
  });
});
