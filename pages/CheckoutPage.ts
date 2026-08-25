import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CustomerInfo } from '../types';

/** Covers checkout step one (info), step two (overview), and the confirmation page. */
export class CheckoutPage extends BasePage {
  // Step one: customer information
  private readonly firstNameInput = this.page.locator('#first-name');
  private readonly lastNameInput = this.page.locator('#last-name');
  private readonly postalCodeInput = this.page.locator('#postal-code');
  private readonly continueButton = this.page.locator('#continue');
  private readonly errorMessage = this.page.locator('[data-test="error"]');

  // Step two: order overview
  private readonly summaryItems = this.page.locator('.cart_item');
  private readonly subtotalLabel = this.page.locator('.summary_subtotal_label');
  private readonly taxLabel = this.page.locator('.summary_tax_label');
  private readonly totalLabel = this.page.locator('.summary_total_label');
  private readonly finishButton = this.page.locator('#finish');
  private readonly cancelButton = this.page.locator('#cancel');

  // Confirmation
  private readonly completeHeader = this.page.locator('.complete-header');
  private readonly backHomeButton = this.page.locator('#back-to-products');

  constructor(page: Page) {
    super(page);
  }

  async fillCustomerInfo(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
  }

  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return (await this.errorMessage.textContent())?.trim() ?? '';
  }

  async getItemCount(): Promise<number> {
    return this.summaryItems.count();
  }

  private async parseMoney(locator: typeof this.subtotalLabel): Promise<number> {
    const text = (await locator.textContent()) ?? '';
    const match = text.match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
  }

  async getSubtotal(): Promise<number> {
    return this.parseMoney(this.subtotalLabel);
  }

  async getTax(): Promise<number> {
    return this.parseMoney(this.taxLabel);
  }

  async getTotal(): Promise<number> {
    return this.parseMoney(this.totalLabel);
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async getConfirmationHeader(): Promise<string> {
    await this.completeHeader.waitFor({ state: 'visible' });
    return (await this.completeHeader.textContent())?.trim() ?? '';
  }

  async backToProducts(): Promise<void> {
    await this.clickWhenReady(this.backHomeButton);
  }
}
