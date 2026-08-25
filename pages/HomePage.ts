import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ProductInfo } from '../types';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/** Product listing / inventory page (post-login landing page). */
export class HomePage extends BasePage {
  private readonly pageTitle = this.page.locator('.title');
  private readonly sortDropdown = this.page.locator('[data-test="product-sort-container"]');
  private readonly inventoryItems = this.page.locator('.inventory_item');
  private readonly cartBadge = this.page.locator('.shopping_cart_badge');
  private readonly cartLink = this.page.locator('.shopping_cart_link');
  private readonly burgerMenuButton = this.page.locator('#react-burger-menu-btn');
  private readonly logoutLink = this.page.locator('#logout_sidebar_link');

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/inventory.html');
  }

  async isLoaded(): Promise<boolean> {
    return this.pageTitle.isVisible();
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click({ force: true });
    await this.logoutLink.waitFor({ state: 'attached' });
    await this.logoutLink.dispatchEvent('click');
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  productCard(name: string): Locator {
    return this.inventoryItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: name }) });
  }

  async addProductToCart(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProductFromCart(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openProduct(name: string): Promise<void> {
    await this.productCard(name).locator('.inventory_item_name').click();
  }

  async getCartBadgeCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) {
      return 0;
    }
    return Number(await this.cartBadge.textContent());
  }

  async goToCart(): Promise<void> {
    await this.clickWhenReady(this.cartLink);
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.page.locator('.inventory_item_price').allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async getAllProducts(): Promise<ProductInfo[]> {
    const names = await this.getProductNames();
    const prices = await this.getProductPrices();
    return names.map((name, i) => ({ name, price: prices[i] }));
  }
}