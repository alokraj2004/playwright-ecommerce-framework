import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiCart, ApiLoginResponse, ApiProduct, ApiUser } from '../types';

/**
 * Thin, typed wrapper around APIRequestContext for the FakeStoreAPI
 * (https://fakestoreapi.com) — a public REST API modelling an e-commerce
 * catalog (products, carts, users, auth) used for the API test suite.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  // --- Products ---
  async getProducts(): Promise<APIResponse> {
    return this.request.get('/products');
  }

  async getProduct(id: number): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }

  async getProductsByCategory(category: string): Promise<APIResponse> {
    return this.request.get(`/products/category/${category}`);
  }

  async createProduct(product: Partial<ApiProduct>): Promise<APIResponse> {
    return this.request.post('/products', { data: product });
  }

  async updateProduct(id: number, product: Partial<ApiProduct>): Promise<APIResponse> {
    return this.request.put(`/products/${id}`, { data: product });
  }

  async patchProduct(id: number, product: Partial<ApiProduct>): Promise<APIResponse> {
    return this.request.patch(`/products/${id}`, { data: product });
  }

  async deleteProduct(id: number): Promise<APIResponse> {
    return this.request.delete(`/products/${id}`);
  }

  // --- Carts ---
  async createCart(cart: ApiCart): Promise<APIResponse> {
    return this.request.post('/carts', { data: cart });
  }

  async getCart(id: number): Promise<APIResponse> {
    return this.request.get(`/carts/${id}`);
  }

  async getUserCarts(userId: number): Promise<APIResponse> {
    return this.request.get(`/carts/user/${userId}`);
  }

  // --- Users / auth ---
  async createUser(user: ApiUser): Promise<APIResponse> {
    return this.request.post('/users', { data: user });
  }

  async login(username: string, password: string): Promise<ApiLoginResponse> {
    const response = await this.request.post('/auth/login', { data: { username, password } });
    return response.json();
  }
}
