import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Single product details page (/inventory-item.html?id=X). */
export class ProductPage extends BasePage {
  private readonly name = this.page.locator('.inventory_details_name');
  private readonly description = this.page.locator('.inventory_details_desc');
  private readonly price = this.page.locator('.inventory_details_price');
  private readonly addToCartButton = this.page.getByRole('button', { name: 'Add to cart' });
  private readonly removeButton = this.page.getByRole('button', { name: 'Remove' });
  private readonly backButton = this.page.locator('#back-to-products');

  constructor(page: Page) {
    super(page);
  }

  async getName(): Promise<string> {
    return (await this.name.textContent())?.trim() ?? '';
  }

  async getDescription(): Promise<string> {
    return (await this.description.textContent())?.trim() ?? '';
  }

  async getPrice(): Promise<number> {
    const text = (await this.price.textContent()) ?? '$0';
    return Number(text.replace('$', ''));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async isInCart(): Promise<boolean> {
    return this.removeButton.isVisible();
  }

  async backToProducts(): Promise<void> {
    await this.clickWhenReady(this.backButton);
  }
}
