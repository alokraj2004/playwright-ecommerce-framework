import { test, expect } from '../../../fixtures/fixtures';
import { users, validCustomer } from '../../../test-data/users';
import { products } from '../../../test-data/products';

/**
 * A single end-to-end journey covering the major flows in one pass:
 * login -> browse/sort -> product details -> cart -> checkout -> confirmation -> logout.
 * Complements the focused specs in auth/, products/, cart/, and checkout/.
 */
test.describe('Regression: full purchase journey @regression', () => {
  test('a user can browse, buy, and log out in one session', async ({
    page,
    loginPage,
    homePage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    await test.step('log in', async () => {
      await loginPage.open();
      await loginPage.login(users.standard.username, users.standard.password);
      expect(await homePage.isLoaded()).toBe(true);
    });

    await test.step('sort and inspect a product', async () => {
      await homePage.sortBy('lohi');
      await homePage.openProduct(products.backpack);
      expect(await productPage.getName()).toBe(products.backpack);
    });

    await test.step('add product to cart from the details page', async () => {
      await productPage.addToCart();
      expect(await productPage.isInCart()).toBe(true);
      await productPage.backToProducts();
    });

    await test.step('add a second product from the list and go to cart', async () => {
      await homePage.addProductToCart(products.bikeLight);
      expect(await homePage.getCartBadgeCount()).toBe(2);
      await homePage.goToCart();
      expect(await cartPage.getItemCount()).toBe(2);
    });

    await test.step('complete checkout', async () => {
      await cartPage.checkout();
      await checkoutPage.fillCustomerInfo(validCustomer);
      await checkoutPage.continueToOverview();
      const total = await checkoutPage.getTotal();
      expect(total).toBeGreaterThan(0);
      await checkoutPage.finishOrder();
      expect(await checkoutPage.getConfirmationHeader()).toContain('Thank you');
    });

    await test.step('return home and log out', async () => {
      await checkoutPage.backToProducts();
      await homePage.logout();
      await expect(page).toHaveURL(/^[^?]*\/(index\.html)?$/);
    });
  });
});
