import { Page } from '@playwright/test';

export async function waitForAntdLoading(page: Page) {
  await page.locator('.ant-spin-fullscreen').waitFor({ state: 'hidden' });
}