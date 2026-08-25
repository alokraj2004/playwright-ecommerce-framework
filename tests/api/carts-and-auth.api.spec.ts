import { test, expect } from '../../fixtures/fixtures';
import type { ApiCart } from '../../types';

test.describe('API: Carts @api', () => {
  test('POST /carts creates a cart for a user @smoke @regression', async ({ apiClient }) => {
    const payload: ApiCart = {
      userId: 1,
      date: new Date().toISOString(),
      products: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 },
      ],
    };

    const response = await apiClient.createCart(payload);
    expect([200, 201]).toContain(response.status());

    const cart = (await response.json()) as ApiCart;
    expect(cart).toHaveProperty('id');
    expect(cart.userId).toBe(payload.userId);
    expect(cart.products).toHaveLength(2);
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
    for (const cart of carts) {
      expect(cart.userId).toBe(1);
    }
  });
});

test.describe('API: Auth @api', () => {
  test('POST /auth/login returns a token for valid credentials @smoke @regression', async ({ apiClient }) => {
    const result = await apiClient.login('mor_2314', '83r5^_');

    expect(result).toHaveProperty('token');
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  test('POST /auth/login with invalid credentials does not return a usable token @regression', async ({
    request,
  }) => {
    const response = await request.post('https://fakestoreapi.com/auth/login', {
      data: {
        username: 'not_a_real_user',
        password: 'wrong_password',
      },
    });

    // FakeStoreAPI returns 401 with plain text on invalid auth
    expect(response.status()).toBe(401);
  });

  test('authenticated requests can carry a bearer token header @regression', async ({ request, apiClient }) => {
    const { token } = await apiClient.login('mor_2314', '83r5^_');

    const response = await request.get('https://fakestoreapi.com/products/1', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // The endpoint is public either way; this verifies the client can attach auth headers correctly.
    expect(response.status()).toBe(200);
  });
});