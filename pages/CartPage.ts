import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ProductInfo } from '../types';

export class CartPage extends BasePage {
  private readonly cartItems = this.page.locator('.cart_item');
  private readonly checkoutButton = this.page.locator('[data-test="checkout"]');
  private readonly continueShoppingButton = this.page.locator('[data-test="continue-shopping"]');

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/cart.html');
  }

  cartItem(name: string) {
    return this.cartItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: name }) });
  }

  async isEmpty(): Promise<boolean> {
    return (await this.cartItems.count()) === 0;
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItems(): Promise<ProductInfo[]> {
    const count = await this.cartItems.count();
    const items: ProductInfo[] = [];
    for (let i = 0; i < count; i += 1) {
      const item = this.cartItems.nth(i);
      const name = (await item.locator('.inventory_item_name').textContent())?.trim() ?? '';
      const priceText = (await item.locator('.inventory_item_price').textContent()) ?? '$0';
      items.push({ name, price: Number(priceText.replace('$', '')) });
    }
    return items;
  }

  async getQuantity(name: string): Promise<number> {
    const text = await this.cartItem(name).locator('.cart_quantity').textContent();
    return Number(text ?? '0');
  }

  async removeItem(name: string): Promise<void> {
    await this.cartItem(name).getByRole('button', { name: 'Remove' }).click();
  }

  async getCartTotal(): Promise<number> {
    const items = await this.getItems();
    return Number(items.reduce((sum, item) => sum + item.price, 0).toFixed(2));
  }

  async checkout(): Promise<void> {
    await this.clickWhenReady(this.checkoutButton);
  }

  async continueShopping(): Promise<void> {
    await this.clickWhenReady(this.continueShoppingButton);
  }
}
