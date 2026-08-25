import { test, expect } from '../../fixtures/fixtures';
import { newApiProduct } from '../../test-data/products';
import type { ApiProduct } from '../../types';

test.describe('API: Products @api', () => {
  test('GET /products returns a list of products with the expected schema @smoke', async ({ apiClient }) => {
    const response = await apiClient.getProducts();
    expect(response.status()).toBe(200);

    const items = (await response.json()) as ApiProduct[];
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);

    for (const item of items.slice(0, 5)) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(typeof item.price).toBe('number');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('image');
    }
  });

  test('GET /products/:id returns a single product @smoke', async ({ apiClient }) => {
    const response = await apiClient.getProduct(1);
    expect(response.status()).toBe(200);

    const product = (await response.json()) as ApiProduct;
    expect(product.id).toBe(1);
    expect(product.title.length).toBeGreaterThan(0);
    expect(product.price).toBeGreaterThan(0);
  });

  test('GET /products/:id with a non-existent id returns no body @regression', async ({ apiClient }) => {
    const response = await apiClient.getProduct(999999);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body === 'null' || body === '').toBe(true);
  });

  test('GET /products/category/:category filters by category @regression', async ({ apiClient }) => {
    const response = await apiClient.getProductsByCategory('electronics');
    expect(response.status()).toBe(200);

    const items = (await response.json()) as ApiProduct[];
    for (const item of items) {
      expect(item.category).toBe('electronics');
    }
  });

  test('POST /products creates a new product @smoke @regression', async ({ apiClient }) => {
    const response = await apiClient.createProduct(newApiProduct);
    expect([200, 201]).toContain(response.status());

    const created = (await response.json()) as ApiProduct;
    expect(created).toHaveProperty('id');
    expect(created.title).toBe(newApiProduct.title);
    expect(created.price).toBe(newApiProduct.price);
  });

  test('PUT /products/:id fully replaces a product @regression', async ({ apiClient }) => {
    const response = await apiClient.updateProduct(1, { ...newApiProduct, title: 'Updated Title' });
    expect(response.status()).toBe(200);

    const updated = (await response.json()) as ApiProduct;
    expect(updated.title).toBe('Updated Title');
  });

  test('PATCH /products/:id partially updates a product @regression', async ({ apiClient }) => {
    const response = await apiClient.patchProduct(1, { price: 123.45 });
    expect(response.status()).toBe(200);

    const patched = (await response.json()) as ApiProduct;
    expect(patched.price).toBe(123.45);
  });

  test('DELETE /products/:id removes a product @regression', async ({ apiClient }) => {
    const response = await apiClient.deleteProduct(1);
    expect(response.status()).toBe(200);

    const deleted = (await response.json()) as ApiProduct;
    expect(deleted.id).toBe(1);
  });

  test('POST /products with an invalid payload does not crash the API @regression', async ({ apiClient }) => {
    const response = await apiClient.createProduct({ title: '' });
    expect(response.status()).toBeLessThan(500);
  });
});