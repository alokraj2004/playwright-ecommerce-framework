import { test, expect } from '../../../fixtures/fixtures';
import { products } from '../../../test-data/products';
import { incompleteCustomers, validCustomer } from '../../../test-data/users';
import { calculateTax, round2 } from '../../../utils/money';

test.describe('Checkout', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.addProductToCart(products.backpack);
    await authenticatedPage.addProductToCart(products.bikeLight);
    await authenticatedPage.goToCart();
  });

  test('completes checkout with valid customer information @smoke @regression', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.continueToOverview();
    await checkoutPage.finishOrder();

    const header = await checkoutPage.getConfirmationHeader();
    expect(header).toContain('Thank you for your order');
  });

  for (const { description, info } of incompleteCustomers) {
    test(`rejects checkout when ${description} @regression`, async ({ cartPage, checkoutPage }) => {
      await cartPage.checkout();
      await checkoutPage.fillCustomerInfo(info);
      await checkoutPage.continueToOverview();

      const error = await checkoutPage.getErrorMessage();
      expect(error.length).toBeGreaterThan(0);
    });
  }

  test('order overview lists every item that was in the cart @smoke @regression', async ({
    cartPage,
    checkoutPage,
  }) => {
    const cartItemCount = await cartPage.getItemCount();

    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.continueToOverview();

    expect(await checkoutPage.getItemCount()).toBe(cartItemCount);
  });

  test('total price equals subtotal plus tax @smoke @regression', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.continueToOverview();

    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    expect(tax).toBe(calculateTax(subtotal));
    expect(total).toBe(round2(subtotal + tax));
  });

  test('cancelling checkout returns to the cart @regression', async ({ page, cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.continueToOverview();

    await checkoutPage.cancel();

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('order confirmation clears the cart @regression', async ({ authenticatedPage, cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.continueToOverview();
    await checkoutPage.finishOrder();
    await checkoutPage.backToProducts();

    expect(await authenticatedPage.getCartBadgeCount()).toBe(0);
  });
});
