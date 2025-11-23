import { test, expect } from '@playwright/test';
import { clearSession } from './test-helpers';
import { CATEGORIES, LANGUAGES, DIFFICULTIES, TIMER_OPTIONS } from './fixtures';

test.describe('Game Configuration and Settings Validation', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await page.goto('/');
  });

  test('should require minimum 3 players in single-device mode', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Clear all player inputs
    const inputs = page.locator('input[placeholder^="Player"]');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear();
    }

    // Fill only 2 players
    await inputs.nth(0).fill('Player1');
    await inputs.nth(1).fill('Player2');

    // Start button should be disabled
    const startButton = page.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeDisabled();

    // Should show warning
    await expect(page.getByText(/minimum 3 players/i)).toBeVisible();

    // Add third player
    await inputs.nth(2).fill('Player3');

    // Now start button should be enabled
    await expect(startButton).toBeEnabled();
  });

  test('should require at least one category selected', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Fill in 3 players
    const inputs = page.locator('input[placeholder^="Player"]');
    await inputs.nth(0).fill('Player1');
    await inputs.nth(1).fill('Player2');
    await inputs.nth(2).fill('Player3');

    // Show all categories
    const showMoreButton = page.getByTestId('show-more-categories');
    if (await showMoreButton.isVisible()) {
      await showMoreButton.click();
    }

    // Click "Select All" to deselect all (it will keep locations minimum)
    const selectAllButton = page.getByRole('button', { name: /✓ All|Select All/i });
    const buttonText = await selectAllButton.textContent();
    if (buttonText?.includes('✓ All')) {
      await selectAllButton.click();
    }

    // Should still have at least one category selected (locations is minimum)
    // Verify at least one category button is active
    const activeCategoryButtons = page.locator('[data-testid^="category-"][data-active="true"]');
    const activeCount = await activeCategoryButtons.count();
    expect(activeCount).toBeGreaterThanOrEqual(1);

    // Start button should still be enabled
    const startButton = page.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeEnabled();
  });

  test('should allow category selection and deselection', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Show all categories
    const showMoreButton = page.getByTestId('show-more-categories');
    if (await showMoreButton.isVisible()) {
      await showMoreButton.click();
    }

    // Deselect all first
    const selectAllButton = page.getByRole('button', { name: /✓ All|Select All/i });
    const buttonText = await selectAllButton.textContent();
    if (buttonText?.includes('✓ All')) {
      await selectAllButton.click(); // Deselects all except minimum
    }

    // Now select specific categories
    const foodCategory = page.getByTestId('category-food');
    await foodCategory.click();

    // Verify it's selected
    const isFoodActive = await foodCategory.getAttribute('data-active');
    expect(isFoodActive).toBe('true');

    // Select another category
    const animalsCategory = page.getByTestId('category-animals');
    await animalsCategory.click();

    const isAnimalsActive = await animalsCategory.getAttribute('data-active');
    expect(isAnimalsActive).toBe('true');
  });

  test('should allow difficulty level selection', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Test each difficulty level
    for (const difficulty of DIFFICULTIES) {
      const diffButton = page.getByTestId(`difficulty-${difficulty}`);
      await diffButton.click();

      // Verify it's active
      const isActive = await diffButton.getAttribute('data-active');
      expect(isActive).toBe('true');
    }
  });

  test('should allow language selection', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Show all languages
    const showMoreLangButton = page.getByTestId('show-more-languages');
    if (await showMoreLangButton.isVisible()) {
      await showMoreLangButton.click();
    }

    // Test selecting different languages
    const testLanguages = ['en', 'fa', 'sv'];

    for (const code of testLanguages) {
      const langButton = page.getByTestId(`language-${code}`);
      await langButton.click();

      // Verify it's active
      const isActive = await langButton.getAttribute('data-active');
      expect(isActive).toBe('true');
    }
  });

  test('should allow timer duration selection', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Test each timer option
    for (const minutes of TIMER_OPTIONS) {
      const timerButton = page.getByTestId(`timer-${minutes}`);
      await timerButton.click();

      // Verify it's active
      const isActive = await timerButton.getAttribute('data-active');
      expect(isActive).toBe('true');
    }
  });

  test('should show roles toggle only when locations is sole category', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Show all categories
    const showMoreButton = page.getByTestId('show-more-categories');
    if (await showMoreButton.isVisible()) {
      await showMoreButton.click();
    }

    // Deselect all to keep only locations
    const selectAllButton = page.getByRole('button', { name: /✓ All|Select All/i });
    const buttonText = await selectAllButton.textContent();
    if (buttonText?.includes('✓ All')) {
      await selectAllButton.click();
    }

    // Now only locations should be selected, roles toggle should appear
    // Look for "Word Only" or "Word + Role" buttons which indicate roles mode
    const rolesToggle = page.getByRole('button', { name: /word only|word \+ role/i }).first();
    await expect(rolesToggle).toBeVisible();

    // Add another category (food)
    const foodCategory = page.getByTestId('category-food');
    await foodCategory.click();

    // Roles toggle should disappear
    await expect(rolesToggle).not.toBeVisible();
  });

  test('should persist settings across page refreshes', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Configure specific settings
    const inputs = page.locator('input[placeholder^="Player"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');
    await inputs.nth(2).fill('Charlie');

    // Select 10 minute timer
    await page.getByRole('button', { name: '10 min' }).click();

    // Select hard difficulty
    await page.getByRole('button', { name: /hard/i }).first().click();

    // Wait for settings to be saved (500ms debounce)
    await page.waitForTimeout(600);

    // Refresh page
    await page.reload();

    // Go back to single device mode
    await page.getByRole('button', { name: /single device/i }).click();

    // Verify settings are persisted
    const persistedNames = [];
    for (let i = 0; i < 3; i++) {
      persistedNames.push(await inputs.nth(i).inputValue());
    }
    expect(persistedNames).toContain('Alice');
    expect(persistedNames).toContain('Bob');
    expect(persistedNames).toContain('Charlie');

    // Verify timer
    const timer10Button = page.getByTestId('timer-10');
    const isTimerActive = await timer10Button.getAttribute('data-active');
    expect(isTimerActive).toBe('true');

    // Verify difficulty
    const hardButton = page.getByTestId('difficulty-hard');
    const isDiffActive = await hardButton.getAttribute('data-active');
    expect(isDiffActive).toBe('true');
  });

  test('should require host name in multi-device mode', async ({ page }) => {
    await page.getByRole('button', { name: /multi device/i }).click();

    // Create room button should be disabled without name
    const createButton = page.getByRole('button', { name: /create room/i });
    await expect(createButton).toBeDisabled();

    // Should show warning
    await expect(page.getByText(/please enter your name/i)).toBeVisible();

    // Enter name
    await page.getByPlaceholder(/name/i).fill('Host');

    // Button should now be enabled
    await expect(createButton).toBeEnabled();
  });

  test('should allow selecting "Select All" categories', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Show all categories
    const showMoreButton = page.getByTestId('show-more-categories');
    if (await showMoreButton.isVisible()) {
      await showMoreButton.click();
    }

    // Click "Select All"
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    // Verify all categories are selected
    // The button text should change to "✓ All"
    await expect(page.getByRole('button', { name: /✓ all/i })).toBeVisible();

    // Verify category count shows all
    await expect(page.getByText(`Word Categories (${CATEGORIES.length}/${CATEGORIES.length})`)).toBeVisible();
  });

  test('should allow adding and removing players up to limits', async ({ page }) => {
    await page.getByRole('button', { name: /single device/i }).click();

    // Start with 4 default players, add more
    let addButton = page.getByRole('button', { name: '+ Add Player' });

    // Add players until we reach limit (10)
    let addCount = 0;
    while (addCount < 6 && await addButton.isVisible()) {
      await addButton.click();
      addCount++;
    }

    // Add button should not be visible when we have 10 players
    const inputs = page.locator('input[placeholder^="Player"]');
    const playerCount = await inputs.count();
    if (playerCount >= 10) {
      await expect(addButton).not.toBeVisible();
    }

    // Remove players (should have remove button for players beyond minimum 3)
    if (playerCount > 3) {
      const removeButtons = page.locator('button[title="Remove player"]');
      const removeCount = await removeButtons.count();
      expect(removeCount).toBeGreaterThan(0);

      // Remove one player
      await removeButtons.first().click();

      // Verify player count decreased
      const newPlayerCount = await inputs.count();
      expect(newPlayerCount).toBe(playerCount - 1);
    }
  });

  test('should allow mode switching between single and multi-device', async ({ page }) => {
    // Start in single device
    await page.getByRole('button', { name: /single device/i }).click();
    await expect(page.getByText(/players \(/i)).toBeVisible();

    // Switch to multi-device
    await page.getByRole('button', { name: /multi device/i }).click();
    await expect(page.getByText(/your name \(host\)/i)).toBeVisible();

    // Switch back to single device
    await page.getByRole('button', { name: /single device/i }).click();
    await expect(page.getByText(/players \(/i)).toBeVisible();
  });
});
