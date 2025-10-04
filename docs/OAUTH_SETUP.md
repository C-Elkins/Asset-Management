# OAuth Configuration Checklist

This guide helps you set up Google and Microsoft OAuth/SSO authentication for the Krubles Asset Management system.

## Why OAuth Buttons Are Missing

If you don't see the "Sign in with Google" or "Sign in with Microsoft" buttons on the login/signup pages, it's because the OAuth client IDs are not configured in your environment variables.

**The buttons only appear when the corresponding environment variables are set.**

## Quick Setup

### 1. Copy Environment Template

```bash
cd frontend
cp .env.example .env.development
```

### 2. Configure Google OAuth (Optional)

**To enable "Sign in with Google" button:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID (or use existing)
3. Add authorized JavaScript origins:
   - `http://localhost:3005` (development)
   - `https://yourdomain.com` (production)
4. Add authorized redirect URIs:
   - `http://localhost:3005/auth/google/callback`
   - `https://yourdomain.com/auth/google/callback`
5. Copy the Client ID
6. Update `.env.development`:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 3. Configure Microsoft OAuth (Optional)

**To enable "Sign in with Microsoft" button:**

1. Go to [Azure Portal - App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Create a new app registration (or use existing)
3. Under "Authentication", add redirect URI:
   - Platform: Single-page application (SPA)
   - URI: `http://localhost:3005/auth/microsoft/callback`
4. Under "API permissions", add:
   - Microsoft Graph → Delegated → `User.Read`
   - Microsoft Graph → Delegated → `openid`
   - Microsoft Graph → Delegated → `profile`
   - Microsoft Graph → Delegated → `email`
5. Copy the Application (client) ID
6. Update `.env.development`:

```env
VITE_MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
VITE_MICROSOFT_TENANT_ID=common
```

**Tenant ID options:**
- `common` - Multi-tenant (work/school + personal Microsoft accounts) **← Recommended**
- `organizations` - Work/school accounts only
- `consumers` - Personal Microsoft accounts only
- `{your-tenant-id}` - Specific Azure AD tenant

### 4. Restart Development Server

After configuring environment variables:

```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

The OAuth buttons should now appear on both login and signup pages!

## Backend Configuration

The backend OAuth endpoints are already configured in `application.yml`:

```yaml
# Google OAuth
oauth2:
  google:
    client-id: ${GOOGLE_CLIENT_ID:}
    
# Microsoft OAuth  
oauth2:
  microsoft:
    client-id: ${MICROSOFT_CLIENT_ID:}
    tenant-id: ${MICROSOFT_TENANT_ID:common}
```

Set these environment variables for the backend:

```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export MICROSOFT_CLIENT_ID=your-microsoft-client-id
export MICROSOFT_TENANT_ID=common
```

Or add them to `backend/.env` if using environment file loading.

## Verification

### ✅ OAuth is Configured Correctly When:

- You see "Sign in with Google" button with Google logo
- You see "Sign in with Microsoft" button with Microsoft logo
- Buttons appear on both `/signin` and `/signup` pages
- Clicking buttons opens OAuth popup/redirect
- No console errors about missing client IDs

### ❌ OAuth is NOT Configured When:

- OAuth buttons are completely missing
- Console shows: "Microsoft authentication is not configured"
- Console shows: "Google authentication is not configured"
- Buttons are grayed out or disabled

## Testing OAuth Flow

### Google OAuth Test:

1. Navigate to `http://localhost:3005/signin`
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. You should be redirected to dashboard

### Microsoft OAuth Test:

1. Navigate to `http://localhost:3005/signin`
2. Click "Sign in with Microsoft"
3. Select your Microsoft account
4. Grant permissions
5. You should be redirected to dashboard

## Troubleshooting

### Problem: Buttons Still Missing After Configuration

**Solution**: Make sure you restarted the dev server after adding environment variables. Vite only reads `.env` files on startup.

```bash
# Restart frontend dev server
npm run dev
```

### Problem: "Client ID not configured" Error

**Solution**: 
1. Verify the environment variable is set correctly in `.env.development`
2. Variable names must be exact: `VITE_GOOGLE_CLIENT_ID` and `VITE_MICROSOFT_CLIENT_ID`
3. No quotes needed around values
4. Restart dev server

### Problem: OAuth Popup Blocked

**Solution**: 
1. Allow popups for `localhost:3005` in your browser
2. Or use redirect flow instead of popup (requires code changes)

### Problem: "Redirect URI Mismatch" Error

**Solution**:
1. Verify redirect URIs match exactly in Google/Azure console
2. Must include protocol (`http://` or `https://`)
3. No trailing slashes
4. Port numbers must match

## Production Deployment

For production, update `.env.production`:

```env
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
VITE_MICROSOFT_TENANT_ID=common
```

And update authorized origins/redirect URIs in Google/Azure to include production domain.

## Detailed Documentation

For comprehensive setup guides, see:

- [Google OAuth Integration Guide](./docs/google-oauth-integration.md)
- [Microsoft OAuth Integration Guide](./docs/microsoft-oauth-integration.md)

## Environment Variables Reference

### Frontend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth Client ID | `123-abc.apps.googleusercontent.com` |
| `VITE_MICROSOFT_CLIENT_ID` | No | Microsoft App Client ID | `12345678-1234-1234-1234-123456789abc` |
| `VITE_MICROSOFT_TENANT_ID` | No | Microsoft Tenant ID | `common` (default) |

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | No | Google OAuth Client ID (same as frontend) |
| `MICROSOFT_CLIENT_ID` | No | Microsoft App Client ID (same as frontend) |
| `MICROSOFT_TENANT_ID` | No | Microsoft Tenant ID (default: `common`) |

---

**Need Help?** Check the detailed integration guides or open an issue on GitHub!
