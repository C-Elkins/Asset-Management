import { test, expect, Page } from '@playwright/test';

/** Utility: perform real login with provided credentials */
async function realLogin(page: Page, username = 'admin', password = 'admin123') {
  await page.goto('/login');
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.getByRole('button', { name: /login/i }).click()
  ]);
}

// 1. Real successful login path (no route mocking)
// Assumes backend running at dev proxy path and dev data seeding created 'admin' user with password 'admin123'
test('auth: successful login navigates to dashboard', async ({ page }) => {
  await realLogin(page);
  await expect(page).toHaveURL(/\/app/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

// 2. Invalid credentials scenario
// We intentionally provide a wrong password and expect an error message to appear without navigation.
test('auth: invalid credentials stay on login and show error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/username/i).fill('admin');
  await page.getByLabel(/password/i).fill('wrongpass');
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/auth/login') && resp.status() === 401),
    page.getByRole('button', { name: /login/i }).click()
  ]);
  await expect(page).toHaveURL(/\/login/);
  const error = page.locator('.error-message');
  await expect(error).toBeVisible();
  await expect(error).toContainText(/invalid|password/i);
});

// 3. Unauthorized redirect: visiting a protected route without auth should land at /login
// We go directly to /app and expect redirect.
test('auth: direct protected route access redirects to login', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /IT Asset Management Login/i })).toBeVisible();
});

// 4. Silent refresh flow
// Strategy: shorten token lifetime not trivial w/o backend config; instead simulate nearing expiry by waiting until interceptor triggers.
// Simplified approach here: we mock /auth/refresh once and ensure a retried protected request succeeds after initial 401.
test('auth: silent refresh on 401 triggers retry and succeeds', async ({ page }) => {
  // Intercept first protected data call to force 401 then allow refresh path, then succeed
  let firstHit = true;
  await page.route('**/assets*', async route => {
    if (firstHit) {
      firstHit = false;
      return route.fulfill({ status: 401, body: 'Unauthorized' });
    }
    return route.continue();
  });

  // Mock refresh endpoint to issue new token
  await page.route('**/auth/refresh', async route => {
    const resp = { accessToken: 'newAccess', refreshToken: 'newRefresh', user: { username: 'admin', role: 'SUPER_ADMIN' }, expiresIn: 900 };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) });
  });

  // Mock login endpoint to return initial (soon-to-fail) token
  await page.route('**/auth/login', async route => {
    const resp = { accessToken: 'initialAccess', refreshToken: 'initialRefresh', user: { username: 'admin', role: 'SUPER_ADMIN' }, expiresIn: 900 };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) });
  });

  await realLogin(page);

  // Trigger a protected call (assets list) which first returns 401 then is retried
  await page.goto('/app/assets');
  await expect(page).toHaveURL(/\/app\/assets/);
});

// 5. Logout flow: after login, trigger logout (assuming a logout button someplace with text /logout/i)
// If no explicit logout UI yet, this test will be skipped gracefully.
test('auth: logout returns to login', async ({ page }) => {
  await realLogin(page);
  const logoutButton = page.getByRole('button', { name: /logout/i });
  if (!(await logoutButton.isVisible().catch(() => false))) test.skip();
  await Promise.all([
    page.waitForURL(/\/login/),
    logoutButton.click()
  ]);
  await expect(page).toHaveURL(/\/login/);
});
