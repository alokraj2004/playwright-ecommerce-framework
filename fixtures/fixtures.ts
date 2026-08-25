import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ApiClient } from '../api/ApiClient';
import { users } from '../test-data/users';

interface Fixtures {
  loginPage: LoginPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  apiClient: ApiClient;
  /** Provides a page that is already logged in as the standard user. */
  authenticatedPage: HomePage;
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
    
    // Explicitly wait for navigation to complete and inventory items to render
    await page.waitForURL(/.*inventory\.html/, { timeout: 15000 });
    await page.locator('.inventory_item').first().waitFor({ state: 'visible', timeout: 15000 });
    
    await use(homePage);
  },
});

export { expect } from '@playwright/test';