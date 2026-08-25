import { test, expect } from '../../../fixtures/fixtures';
import { products } from '../../../test-data/products';

test.describe('Product Catalog', () => {
  test('lists all products with a name and a price @smoke @regression', async ({ authenticatedPage }) => {
    const items = await authenticatedPage.getAllProducts();

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.price).toBeGreaterThan(0);
    }
  });

  test('finds a specific product by name @regression', async ({ authenticatedPage }) => {
    const card = authenticatedPage.productCard(products.backpack);

    await expect(card).toBeVisible();
    await expect(card.locator('.inventory_item_name')).toHaveText(products.backpack);
  });

  test('shows no matching card for a product that does not exist @regression', async ({ authenticatedPage }) => {
    const names = await authenticatedPage.getProductNames();

    expect(names).not.toContain('Nonexistent Product 12345');
  });

  test('sorts products from A to Z @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('az');
    const names = await authenticatedPage.getProductNames();

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('sorts products from Z to A @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('za');
    const names = await authenticatedPage.getProductNames();

    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('sorts products by price low to high @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('lohi');
    const prices = await authenticatedPage.getProductPrices();

    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by price high to low @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('hilo');
    const prices = await authenticatedPage.getProductPrices();

    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('shows full product details on the details page @smoke @regression', async ({
    authenticatedPage,
    productPage,
  }) => {
    await authenticatedPage.openProduct(products.backpack);

    expect(await productPage.getName()).toBe(products.backpack);
    expect((await productPage.getDescription()).length).toBeGreaterThan(0);
    expect(await productPage.getPrice()).toBeGreaterThan(0);
  });

  test('navigates back to the product list from the details page @regression', async ({
    authenticatedPage,
    productPage,
  }) => {
    await authenticatedPage.openProduct(products.bikeLight);
    await productPage.backToProducts();

    expect(await authenticatedPage.isLoaded()).toBe(true);
  });
});
