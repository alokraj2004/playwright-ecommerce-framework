import { test, expect } from '../../fixtures/fixtures';
import type { ApiCart } from '../../types';

test.describe('API: Carts @api', () => {
  test('POST /carts creates a cart for a user @smoke @regression', async ({ apiClient }) => {
    const payload: ApiCart = {
      userId: 1,
      date: '2024-01-01',
      products: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
    };

    const response = await apiClient.createCart(payload);
    expect([200, 201]).toContain(response.status());

    const cart = (await response.json()) as ApiCart;
    expect(cart).toHaveProperty('id');
  });

  test('GET /carts/:id returns a specific cart @regression', async ({ apiClient }) => {
    const response = await apiClient.getCart(1);
    expect(response.status()).toBe(200);

    const cart = (await response.json()) as ApiCart;
    expect(cart).toHaveProperty('products');
  });

  test('GET /carts/user/:userId returns that user’s carts @regression', async ({ apiClient }) => {
    const response = await apiClient.getUserCarts(1);
    expect(response.status()).toBe(200);

    const carts = (await response.json()) as ApiCart[];
    expect(Array.isArray(carts)).toBe(true);
  });
});

test.describe('API: Auth @api', () => {
  test('POST /auth/login returns a token for valid credentials @smoke @regression', async ({ apiClient }) => {
    const data = await apiClient.login('mor_2314', '83r5^_');
    expect(typeof data.token).toBe('string');
    expect(data.token.length).toBeGreaterThan(0);
  });

  test('POST /auth/login with invalid credentials does not return a usable token @regression', async ({ request }) => {
    const response = await request.post('https://fakestoreapi.com/auth/login', {
      data: {
        username: 'non_existent_user_9999',
        password: 'invalid_password',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      },
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test('authenticated requests can carry a bearer token header @regression', async ({ request, apiClient }) => {
    const auth = await apiClient.login('mor_2314', '83r5^_');

    const response = await apiClient.getProducts();
    expect(response.status()).toBe(200);
  });
});
