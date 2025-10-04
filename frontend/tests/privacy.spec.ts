import { test, expect, Page } from '@playwright/test';

// Assumptions:
// - Preview or dev server is running depending on the config used
// - Backend is available on http://localhost:8080/api/v1 for auth + privacy endpoints when using dev config
// - Demo user exists: user@devorg.com / DevUser123!

const email = process.env.E2E_USER_EMAIL || 'user@devorg.com';
const password = process.env.E2E_USER_PASSWORD || 'DevUser123!';

// In-memory stub state for mocked endpoints
let consentState = {
  marketingEmails: false,
  analytics: false,
  dataProcessing: true,
  consentVersion: '1.0'
};

test.beforeEach(async ({ page }) => {
  // Mock auth endpoints
  await page.route('**/api/v1/auth/login', async route => {
    let body: any = {};
    try {
      body = route.request().postDataJSON();
    } catch {
      try { body = JSON.parse(route.request().postData() || '{}'); } catch { body = {}; }
    }
    if (body?.username === email || body?.email === email) {
      return route.fulfill({
        contentType: 'application/json',
        status: 200,
        body: JSON.stringify({
          accessToken: 'test-access',
          refreshToken: 'test-refresh',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: {
            id: 1,
            email,
            firstName: 'Dev',
            lastName: 'User',
            role: 'USER',
          }
        })
      });
    }
    return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid' }) });
  });

  await page.route('**/api/v1/auth/me', async route => {
    return route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify({ id: 1, email, firstName: 'Dev', lastName: 'User', role: 'USER' })
    });
  });

  // Mock privacy endpoints
  await page.route('**/api/v1/privacy/policy-status', route => route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify({ frameworks: ['GDPR', 'CCPA'], policyVersion: '1.0', lastUpdated: '2025-01-01', tenantId: 1 })
  }));

  await page.route('**/api/v1/privacy/consent', async route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(consentState) });
    }
    if (route.request().method() === 'PUT') {
      let update: any = {};
      try { update = route.request().postDataJSON(); } catch { try { update = JSON.parse(route.request().postData() || '{}'); } catch { update = {}; } }
      consentState = { ...consentState, ...update };
      return route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(consentState) });
    }
    return route.fallback();
  });

  await page.route('**/api/v1/privacy/my-data', route => route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify({ user: { id: 1, email }, consent: consentState })
  }));

  await page.route('**/api/v1/privacy/request-deletion', route => route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify({ message: 'Deletion request received.' })
  }));
});

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/app/dashboard');
}

test.describe('Privacy Page', () => {
  test('can toggle and persist consent, and download data', async ({ page, context }) => {
    await login(page);

    // Navigate to Privacy
    await page.getByRole('link', { name: /privacy/i }).click();
    await expect(page).toHaveURL(/\/app\/privacy/);

    // Toggle Analytics (locate the row by text and click its toggle button)
    const analyticsRow = page.locator('div.bg-slate-50.rounded-lg:has-text("Analytics")').first();
    const analyticsToggle = analyticsRow.locator('button').first();
    await analyticsToggle.click();
    await Promise.all([
      page.waitForRequest((req) => req.url().includes('/api/v1/privacy/consent') && req.method() === 'PUT'),
      page.getByRole('button', { name: /save preferences/i }).click(),
    ]);

    // Wait for toast or small delay for save
    await page.waitForTimeout(500);

    // Refresh to verify persistence
    await page.reload();

    // Verify persistence by fetching within the page (routes are intercepted)
    const json = await page.evaluate(async () => {
      const r = await fetch('/api/v1/privacy/consent');
      return r.json();
    });
    expect(json.analytics).toBeTruthy();

    // Download JSON
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download json/i }).click(),
    ]);
    const suggested = download.suggestedFilename();
    expect(suggested).toMatch(/my-data-.*\.json/);

    // Sanity: my-data content request
    const storageState = await context.storageState();
    expect(storageState.origins.length).toBeGreaterThan(0);
  });
});
