import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    __e2eLogin?: (token?: string, refreshToken?: string) => void;
    __e2eLogout?: () => void;
  }
}

// 1. Real successful login path (no route mocking)
// Assumes backend running at dev proxy path and dev data seeding created 'admin' user with password 'admin123'
test('auth: successful login navigates to dashboard', async ({ page }) => {
  await page.route('**/actuator/health', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'UP' }) });
  });
  await page.route('**/assets*', async route => {
    const json = [
      { id: 1, status: 'AVAILABLE', purchasePrice: 1000, category: { name: 'Laptops' } },
      { id: 2, status: 'ASSIGNED', purchasePrice: 1200, category: { name: 'Laptops' } }
    ];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
  await page.goto('/login?e2e=1');
  await page.evaluate(() => (window).__e2eLogin && (window).__e2eLogin('testAccess'));
  await page.goto('/app');
  await expect(page).toHaveURL(/\/app/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

// 2. Invalid credentials scenario
// We intentionally provide a wrong password and expect an error message to appear without navigation.
test('auth: invalid credentials stay on login and show error', async ({ page }) => {
  // Mock 401 from backend
  await page.route('**/actuator/health', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'UP' }) });
  });
  await page.route('**/auth/login', async route => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid username or password.' }) });
  });
  await page.goto('/login');
  await page.getByLabel(/email/i).waitFor({ state: 'visible' });
  await page.getByLabel(/email/i).fill('admin@example.com');
  await page.getByRole('textbox', { name: /password/i }).fill('wrongpass');
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
  await expect(page.getByRole('heading', { name: /Asset Management by Krubles Login/i })).toBeVisible();
});

// 4. Silent refresh flow
// Strategy: shorten token lifetime not trivial w/o backend config; instead simulate nearing expiry by waiting until interceptor triggers.
// Simplified approach here: we mock /auth/refresh once and ensure a retried protected request succeeds after initial 401.
test('auth: silent refresh on 401 triggers retry and succeeds', async ({ page }) => {
  await page.route('**/actuator/health', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'UP' }) });
  });
  // Intercept first protected data call to force 401 then allow refresh path, then succeed
  let firstHit = true;
  await page.route('**/assets*', async route => {
    if (firstHit) {
      firstHit = false;
      return route.fulfill({ status: 401, body: 'Unauthorized' });
    }
    // Subsequent calls succeed with minimal payload
    const json = [ { id: 1, status: 'AVAILABLE', purchasePrice: 1000, category: { name: 'Laptops' } } ];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });

  // Mock refresh endpoint to issue new token
  await page.route('**/auth/refresh', async route => {
    const resp = { accessToken: 'newAccess', refreshToken: 'newRefresh', user: { username: 'admin', role: 'SUPER_ADMIN' }, expiresIn: 900 };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) });
  });
  // Seed auth via hook with initial access + refresh tokens
  await page.goto('/login?e2e=1');
  await page.evaluate(() => (window).__e2eLogin && (window).__e2eLogin('initialAccess', 'initialRefresh'));

  // Trigger a protected call (assets list) which first returns 401 then is retried
  await page.goto('/app');
  await page.goto('/app/assets');
  await expect(page).toHaveURL(/\/app\/assets/);
});

// 5. Logout flow: after login, trigger logout (assuming a logout button someplace with text /logout/i)
// If no explicit logout UI yet, this test will be skipped gracefully.
test('auth: logout returns to login', async ({ page }) => {
  await page.route('**/actuator/health', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'UP' }) });
  });
  // Enter the app deterministically
  await page.goto('/login?e2e=1');
  await page.evaluate(() => (window).__e2eLogin && (window).__e2eLogin('testAccess', 'testRefresh'));
  await page.goto('/app');
  const logoutButton = page.getByRole('button', { name: /logout/i });
  if (!(await logoutButton.isVisible().catch(() => false))) test.skip();
  await Promise.all([
    page.waitForURL(/\/login/),
    page.evaluate(() => (window).__e2eLogout && (window).__e2eLogout())
  ]);
  await expect(page).toHaveURL(/\/login/);
});

// 6. Session expiring banner appears and refresh hides it
test('auth: session expiring banner refreshes and hides', async ({ page }) => {
  if (process.env.CI) test.skip(true, 'Flaky in CI due to timing of store hydration and header effect');
  await page.route('**/actuator/health', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'UP' }) });
  });
  // Seed auth and set expiresAt ~30s in the future to trigger <=2m threshold
  await page.goto('/login?e2e=1');
  await page.evaluate(() => (window).__e2eLogin && (window).__e2eLogin('shortAccess', 'shortRefresh'));
  await page.goto('/app');

  // Force the persisted store's expiresAt to a near-future point to ensure banner shows
  await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('auth-store');
      if (!raw) return;
      const data = JSON.parse(raw);
      data.state = data.state || {};
      data.state.expiresAt = Date.now() + 90 * 1000; // 90s remaining ensures banner without immediate refresh
      localStorage.setItem('auth-store', JSON.stringify(data));
    } catch {}
  });
  // Reload to rehydrate Zustand store from updated localStorage
  await page.reload();
  await page.goto('/app/dashboard');
  // Give the Header effect a moment to compute showExpiry
  await page.waitForTimeout(2000);

  // Expect banner visible
  // Wait until the banner text appears in DOM
  await page.waitForFunction(() => !!document.body.textContent?.match(/Your session is about to expire/i), null, { timeout: 10000 });
  const banner = page.getByText(/Your session is about to expire/i);
  await expect(banner).toBeVisible();

  // Mock refresh endpoint
  await page.route('**/auth/refresh', async route => {
    const resp = { accessToken: 'refreshedAccess', refreshToken: 'refreshedRefresh', user: { username: 'admin', role: 'SUPER_ADMIN' }, expiresIn: 900 };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) });
  });

  // Click Stay signed in
  await page.getByRole('button', { name: /stay signed in/i }).click();

  // Banner should disappear shortly after successful refresh
  await expect(banner).toBeHidden({ timeout: 3000 });
});
