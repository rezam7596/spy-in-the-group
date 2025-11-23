import {expect, test} from '@playwright/test';
import {clearSession, waitForPolling} from './test-helpers';
import {POLLING_TIMEOUT, TEST_PLAYERS} from './fixtures';

test.describe('Voting and Results Accuracy (Multi-Device)', () => {
  test('should handle voting and show correct results for high number of players', async ({browser}) => {
    const contexts = [];
    const pages = [];
    const playersCount = TEST_PLAYERS.tenPlayer.length;

    try {
      // Create browser sessions
      for (let i = 0; i < playersCount; i++) {
        const context = await browser.newContext();
        contexts.push(context);
        const page = await context.newPage();
        pages.push(page);
        await clearSession(page);
      }

      const hostPage = pages[0];

      // Host creates room
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill(TEST_PLAYERS.tenPlayer[0]);
      await hostPage.getByRole('button', {name: '5 min'}).click();
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      // Other players join
      for (let i = 1; i < playersCount; i++) {
        await pages[i].goto(`/join/${roomId}`);
        await pages[i].getByPlaceholder(/name/i).fill(TEST_PLAYERS.tenPlayer[i]);
        await pages[i].getByRole('button', {name: /join/i}).click();
        await expect(pages[i].getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      }

      await waitForPolling(hostPage, 2);

      // Start game
      await hostPage.getByRole('button', {name: /start game/i}).click();

      // All confirm roles
      for (const page of pages) {
        await expect(page.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});
        await page.getByRole('button', {name: /i got it/i}).click();
      }

      // Wait for timer screen
      for (const page of pages) {
        await expect(page.getByText(/time remaining/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      }

      // Host starts voting early
      await hostPage.waitForTimeout(2000);
      await hostPage.getByRole('button', {name: /start voting/i}).click();

      // Wait for voting screen
      for (const page of pages) {
        await expect(page.getByRole('heading', {name: /vote for the spy/i})).toBeVisible({timeout: 10000});
      }

      // All players vote
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const currentPlayer = TEST_PLAYERS.tenPlayer[i];

        // Vote for the first player that isn't themselves
        const otherPlayers = TEST_PLAYERS.tenPlayer.filter(p => p !== currentPlayer);
        await page.getByTestId(`vote-player-${otherPlayers[0]}`).click();
        await page.getByRole('button', {name: /submit vote/i}).click();

        // Should see vote confirmation or game over
        await expect(page.getByText(/vote submitted!|Game Over!/i)).toBeVisible({timeout: 10000});
      }

      // Wait for results
      for (const page of pages) {
        await expect(page.getByText(/wins?|winner/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      }

      // Verify all pages show the same winner
      const winnerTexts = await Promise.all(
        pages.map((page) => page.getByText(/spy wins|non-spies win/i).textContent())
      );

      // All pages should show the same winner
      const firstWinner = winnerTexts[0];
      for (const winner of winnerTexts) {
        expect(winner).toBe(firstWinner);
      }

      // Verify results show spy name and secret word on all pages
      for (const page of pages) {
        await expect(page.getByText(/the spy was/i).first()).toBeVisible();
        await expect(page.getByText(/the word was/i)).toBeVisible();
      }
    } finally {
      for (const context of contexts) {
        await context.close();
      }
    }
  });

  test('should show "waiting for others" when not all votes are in', async ({browser}) => {
    const contexts = [];
    const pages = [];

    try {
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext();
        contexts.push(context);
        const page = await context.newPage();
        pages.push(page);
        await clearSession(page);
      }

      const [hostPage, player1Page, player2Page] = pages;

      // Setup and start game
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: '5 min'}).click();
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      await player1Page.goto(`/join/${roomId}`);
      await player1Page.getByPlaceholder(/name/i).fill('Player1');
      await player1Page.getByRole('button', {name: /join/i}).click();

      await player2Page.goto(`/join/${roomId}`);
      await player2Page.getByPlaceholder(/name/i).fill('Player2');
      await player2Page.getByRole('button', {name: /join/i}).click();

      await waitForPolling(hostPage, 2);
      await hostPage.getByRole('button', {name: /start game/i}).click();

      // Confirm roles
      for (const page of pages) {
        await expect(page.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});
        await page.getByRole('button', {name: /i got it/i}).click();
      }

      // Host starts voting early
      await hostPage.waitForTimeout(2000);
      await hostPage.getByRole('button', {name: /start voting/i}).click();

      // Wait for voting
      for (const page of pages) {
        await expect(page.getByRole('heading', {name: /vote for the spy/i})).toBeVisible({timeout: 10000});
      }

      // Only host votes (host is 'Host', vote for Player1)
      await hostPage.getByTestId('vote-player-Player1').click();
      await hostPage.getByRole('button', {name: /submit vote/i}).click();

      // Host should see "waiting for others"
      await expect(hostPage.getByText(/waiting for other players/i)).toBeVisible({timeout: 10000});

      // Now player1 votes (player1 is 'Player1', vote for Host)
      await player1Page.getByTestId('vote-player-Host').click();
      await player1Page.getByRole('button', {name: /submit vote/i}).click();

      // Both should still be waiting for player2
      await expect(hostPage.getByText(/waiting for other players/i)).toBeVisible();
      await expect(player1Page.getByText(/waiting for other players/i)).toBeVisible();

      // Player2 votes (last one) (player2 is 'Player2', vote for Host)
      await player2Page.getByTestId('vote-player-Host').click();
      await player2Page.getByRole('button', {name: /submit vote/i}).click();

      // All should now see results
      for (const page of pages) {
        await expect(page.getByText(/wins?|winner/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      }
    } finally {
      for (const context of contexts) {
        await context.close();
      }
    }
  });

  test('should not allow voting for yourself', async ({browser}) => {
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

      // Setup game
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Alice');
      await hostPage.getByRole('button', {name: '5 min'}).click();
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      await player1Page.goto(`/join/${roomId}`);
      await player1Page.getByPlaceholder(/name/i).fill('Bob');
      await player1Page.getByRole('button', {name: /join/i}).click();

      await player2Page.goto(`/join/${roomId}`);
      await player2Page.getByPlaceholder(/name/i).fill('Charlie');
      await player2Page.getByRole('button', {name: /join/i}).click();

      await waitForPolling(hostPage, 2);
      await hostPage.getByRole('button', {name: /start game/i}).click();

      // Confirm roles and get to voting
      for (const page of [hostPage, player1Page, player2Page]) {
        await expect(page.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});
        await page.getByRole('button', {name: /i got it/i}).click();
      }

      // Host starts voting early
      await hostPage.waitForTimeout(2000);
      await hostPage.getByRole('button', {name: /start voting/i}).click();

      for (const page of [hostPage, player1Page, player2Page]) {
        await expect(page.getByRole('heading', {name: /vote for the spy/i})).toBeVisible({timeout: 10000});
      }

      // Check that host cannot vote for themselves
      // The voting buttons should not include their own name
      // Verify "Alice" (host) button doesn't exist
      const aliceButton = hostPage.getByTestId('vote-player-Alice');
      await expect(aliceButton).not.toBeVisible();

      // Verify Bob and Charlie buttons exist
      const bobButton = hostPage.getByTestId('vote-player-Bob');
      const charlieButton = hostPage.getByTestId('vote-player-Charlie');
      await expect(bobButton).toBeVisible();
      await expect(charlieButton).toBeVisible();
    } finally {
      await hostContext.close();
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('should preserve vote even after page refresh before results', async ({browser}) => {
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

      // Setup game
      await hostPage.goto('/');
      await hostPage.getByRole('button', {name: /multi device/i}).click();
      await hostPage.getByPlaceholder(/name/i).fill('Host');
      await hostPage.getByRole('button', {name: '5 min'}).click();
      await hostPage.getByRole('button', {name: /create room/i}).click();

      await expect(hostPage.getByText('Game Lobby')).toBeVisible({timeout: POLLING_TIMEOUT});
      const roomId = hostPage.url().match(/join\/([a-zA-Z0-9]+)/)![1];

      await player1Page.goto(`/join/${roomId}`);
      await player1Page.getByPlaceholder(/name/i).fill('Player1');
      await player1Page.getByRole('button', {name: /join/i}).click();

      await player2Page.goto(`/join/${roomId}`);
      await player2Page.getByPlaceholder(/name/i).fill('Player2');
      await player2Page.getByRole('button', {name: /join/i}).click();

      await waitForPolling(hostPage, 2);
      await hostPage.getByRole('button', {name: /start game/i}).click();

      for (const page of [hostPage, player1Page, player2Page]) {
        await expect(page.getByText('Your Role')).toBeVisible({timeout: POLLING_TIMEOUT});
        await page.getByRole('button', {name: /i got it/i}).click();
      }

      // Host starts voting early
      await hostPage.waitForTimeout(2000);
      await hostPage.getByRole('button', {name: /start voting/i}).click();

      for (const page of [hostPage, player1Page, player2Page]) {
        await expect(page.getByRole('heading', {name: /vote for the spy/i})).toBeVisible({timeout: 10000});
      }

      // Host votes for Player1
      await hostPage.getByTestId('vote-player-Player1').click();
      await hostPage.getByRole('button', {name: /submit vote/i}).click();
      await expect(hostPage.getByText(/vote submitted/i)).toBeVisible();

      // Refresh host page
      await hostPage.reload();

      // Should still show vote submitted state
      await expect(hostPage.getByText(/vote submitted/i)).toBeVisible({
        timeout: 10000,
      });

      // Complete the voting with other players
      // Player1 votes for Host, Player2 votes for Host
      await player1Page.getByTestId('vote-player-Host').click();
      await player1Page.getByRole('button', {name: /submit vote/i}).click();

      await player2Page.getByTestId('vote-player-Host').click();
      await player2Page.getByRole('button', {name: /submit vote/i}).click();

      // All should see results
      for (const page of [hostPage, player1Page, player2Page]) {
        await expect(page.getByText(/wins?|winner/i)).toBeVisible({timeout: POLLING_TIMEOUT});
      }
    } finally {
      await hostContext.close();
      await player1Context.close();
      await player2Context.close();
    }
  });
});
