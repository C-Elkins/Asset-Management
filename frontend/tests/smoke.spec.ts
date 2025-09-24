import { test, expect } from '@playwright/test';

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /IT Asset Management Login/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});
