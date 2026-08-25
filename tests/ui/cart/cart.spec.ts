import { test, expect } from '../../../fixtures/fixtures';
import { products } from '../../../test-data/products';
import { round2 } from '../../../utils/money';

test.describe('Shopping Cart', () => {
  test('adds a single product to the cart @smoke @regression', async ({ authenticatedPage, cartPage }) => {
    await authenticatedPage.addProductToCart(products.backpack);
    expect(await authenticatedPage.getCartBadgeCount()).toBe(1);

    await authenticatedPage.goToCart();
    await expect(cartPage.cartItem(products.backpack)).toBeVisible();
  });

  test('adds multiple products to the cart @smoke @regression', async ({ authenticatedPage, cartPage }) => {
    await authenticatedPage.addProductToCart(products.backpack);
    await authenticatedPage.addProductToCart(products.bikeLight);
    await authenticatedPage.addProductToCart(products.boltTShirt);

    expect(await authenticatedPage.getCartBadgeCount()).toBe(3);

    await authenticatedPage.goToCart();
    expect(await cartPage.getItemCount()).toBe(3);
  });

  test('removes a product from the cart @regression', async ({ authenticatedPage, cartPage }) => {
    await authenticatedPage.addProductToCart(products.backpack);
    await authenticatedPage.addProductToCart(products.bikeLight);

    await authenticatedPage.goToCart();
    await cartPage.removeItem(products.backpack);

    expect(await cartPage.getItemCount()).toBe(1);
    await expect(cartPage.cartItem(products.backpack)).toHaveCount(0);
  });

  test('removing a product from the inventory page updates the cart badge @regression', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.addProductToCart(products.backpack);
    expect(await authenticatedPage.getCartBadgeCount()).toBe(1);

    await authenticatedPage.removeProductFromCart(products.backpack);
    expect(await authenticatedPage.getCartBadgeCount()).toBe(0);
  });

  test('cart quantity defaults to 1 per add-to-cart click @regression', async ({ authenticatedPage, cartPage }) => {
    await authenticatedPage.addProductToCart(products.fleeceJacket);

    await authenticatedPage.goToCart();
    expect(await cartPage.getQuantity(products.fleeceJacket)).toBe(1);
  });

  test('cart total equals the sum of item prices @smoke @regression', async ({ authenticatedPage, cartPage }) => {
    await authenticatedPage.addProductToCart(products.backpack);
    await authenticatedPage.addProductToCart(products.onesie);

    await authenticatedPage.goToCart();
    const items = await cartPage.getItems();
    const expectedTotal = round2(items.reduce((sum, item) => sum + item.price, 0));

    expect(await cartPage.getCartTotal()).toBe(expectedTotal);
  });

  test('shows an empty cart when nothing has been added @regression', async ({ authenticatedPage, cartPage }) => {
    await authenticatedPage.goToCart();

    expect(await cartPage.isEmpty()).toBe(true);
    expect(await cartPage.getItemCount()).toBe(0);
  });

  test('continue shopping returns from the cart to the product list @regression', async ({
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.goToCart();
    await cartPage.continueShopping();

    expect(await authenticatedPage.isLoaded()).toBe(true);
  });
});
