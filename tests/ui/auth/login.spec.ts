import { test, expect } from '../../../fixtures/fixtures';
import { users } from '../../../test-data/users';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('logs in with valid credentials @smoke @regression', async ({ page, loginPage, homePage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(async () => {
      expect(await homePage.isLoaded()).toBe(true);
    }).toPass();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('rejects an invalid username @regression', async ({ loginPage }) => {
    await loginPage.login(users.invalidUsername.username, users.invalidUsername.password);

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username and password do not match');
  });

  test('rejects an invalid password @regression', async ({ loginPage }) => {
    await loginPage.login(users.invalidPassword.username, users.invalidPassword.password);

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username and password do not match');
  });

  test('rejects empty credentials @regression', async ({ loginPage }) => {
    await loginPage.login(users.empty.username, users.empty.password);

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username is required');
  });

  test('blocks a locked-out user with a clear error @regression', async ({ loginPage }) => {
    await loginPage.login(users.locked.username, users.locked.password);

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('locked out');
  });

  test('logs out and returns to the login screen @smoke @regression', async ({ loginPage, homePage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(async () => expect(await homePage.isLoaded()).toBe(true)).toPass();

    await homePage.logout();

    expect(await loginPage.isLoginButtonVisible()).toBe(true);
  });

  test('rejects direct navigation to the inventory page without a session @regression', async ({ page, homePage }) => {
    await page.goto('/inventory.html');

    // SauceDemo redirects unauthenticated users back to the login page.
    await expect(page).toHaveURL(/^[^?]*\/(index\.html)?$/);
    expect(await homePage.isLoaded()).toBe(false);
  });
});
