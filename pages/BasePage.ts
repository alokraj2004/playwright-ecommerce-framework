import type { Locator, Page } from '@playwright/test';

/**
 * Shared behavior for every page object. Keeps common waits/interactions in
 * one place so individual page objects stay focused on their own selectors.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  protected async clickWhenReady(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }
}
