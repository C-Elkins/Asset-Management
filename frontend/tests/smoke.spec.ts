import { test, expect } from '@playwright/test';

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /IT Asset Management Login/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

test('login happy path with demo creds', async ({ page }) => {
  // Stub successful auth response with a simple JWT (header.payload.signature)
  const payload = Buffer.from(
    JSON.stringify({ sub: 'admin', username: 'admin', roles: ['ADMIN'] })
  )
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const fakeToken = `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`;

  await page.route('**/api/auth/login', async (route) => {
    const json = { token: fakeToken };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });

  // Provide a small assets dataset so the dashboard can compute stats
  await page.route('**/api/assets?*', async (route) => {
    const json = [
      { id: 1, status: 'AVAILABLE', purchasePrice: 1000, category: { name: 'Laptops' } },
      { id: 2, status: 'ASSIGNED', purchasePrice: 1200, category: { name: 'Laptops' } },
      { id: 3, status: 'IN_MAINTENANCE', purchasePrice: 500, category: { name: 'Monitors' } },
    ];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });

  // Optional statistics endpoint
  await page.route('**/api/assets/statistics', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/login');
  await page.getByLabel(/Username/i).fill('admin');
  await page.getByLabel(/Password/i).fill('admin123');
  await page.getByRole('button', { name: /login/i }).click();

  // Expect redirect to /app and dashboard header visible
  await expect(page).toHaveURL(/\/app/);
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
});
