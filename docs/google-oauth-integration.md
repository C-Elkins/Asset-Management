# Google OAuth 2.0 Integration Guide

## Overview

The Asset Management System now supports **Google OAuth 2.0** authentication, allowing users to sign in using their Google accounts. This provides a seamless single sign-on (SSO) experience and eliminates the need for users to remember additional passwords.

## Features

- ✅ **Sign in with Google** button on login page
- ✅ **Automatic user creation** - New users are created automatically on first Google sign-in
- ✅ **Account linking** - Existing users can link their Google account to their local account
- ✅ **Secure token verification** - Google ID tokens are verified using Google's verification library
- ✅ **Profile sync** - User's name and profile picture are automatically synced from Google
- ✅ **JWT issuance** - After Google authentication, users receive a standard JWT token for API access
- ✅ **No password required** - OAuth2 users don't need local passwords

## Architecture

### Flow Diagram

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│          │          │          │          │          │          │          │
│  User    │──────────▶  Google  │──────────▶  Backend │──────────▶ Database │
│ (Browser)│   Login  │   OAuth  │ ID Token │   OAuth2 │   Save   │  Users   │
│          │◀──────────│          │◀──────────│  Service │◀──────────│          │
└──────────┘  JWT +   └──────────┘  Verify  └──────────┘  Create  └──────────┘
              User Info            & Extract            /Update
                                   Profile
```

### Authentication Flow

1. **User clicks "Sign in with Google"** on the login page
2. **Google Sign-In popup appears** - User selects their Google account and approves permissions
3. **Google issues ID token** - Contains user's email, name, profile picture, and unique Google ID
4. **Frontend sends token to backend** - `POST /api/v1/auth/oauth2/google` with ID token
5. **Backend verifies token** - Uses Google's verification library to ensure token is valid
6. **User lookup/creation**:
   - Check if user exists by Google ID → Log them in
   - Check if user exists by email → Link Google account to existing user
   - Otherwise → Create new user with Google information
7. **JWT token issued** - Backend generates standard JWT token for subsequent API calls
8. **User redirected to dashboard** - Frontend stores JWT and navigates to `/app/dashboard`

## Configuration

### Backend Configuration

#### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User type: **External** (for public access) or **Internal** (for organization only)
   - App name: **Asset Management by Krubles**
   - User support email: Your support email
   - Developer contact: Your email
   - Scopes: **email** and **profile**
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **Asset Management System**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `http://localhost:5173` (Vite development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/v1/auth/oauth2/callback/google` (development)
     - `https://yourdomain.com/api/v1/auth/oauth2/callback/google` (production)
7. Copy **Client ID** and **Client Secret**

#### 2. Backend Environment Variables

Add the following to your `application.yml` or set as environment variables:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
            redirect-uri: "{baseUrl}/api/v1/auth/oauth2/callback/google"
            authorization-grant-type: authorization_code
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
            user-name-attribute: sub
```

**Environment Variables:**

```bash
export GOOGLE_CLIENT_ID="your-google-client-id-here.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
```

### Frontend Configuration

Add your Google Client ID to the frontend environment:

**.env** (development):
```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**.env.production** (production):
```bash
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
```

## API Reference

### POST /api/v1/auth/oauth2/google

Authenticates a user with a Google ID token.

**Request:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response (Success):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "USER",
    "profilePictureUrl": "https://lh3.googleusercontent.com/a/...",
    "authProvider": "GOOGLE"
  },
  "message": "Successfully authenticated with Google"
}
```

**Response (Error):**

```json
{
  "error": "Invalid Google ID token",
  "message": "Token verification failed"
}
```

**Status Codes:**
- `200 OK` - Authentication successful
- `400 Bad Request` - Missing or invalid ID token
- `401 Unauthorized` - Token verification failed
- `500 Internal Server Error` - Server error during authentication

### GET /api/v1/auth/oauth2/status

Check OAuth2 provider availability.

**Response:**

```json
{
  "providers": {
    "google": {
      "enabled": true,
      "status": "available"
    },
    "microsoft": {
      "enabled": false,
      "status": "coming_soon"
    }
  }
}
```

## Database Schema

### Updated User Table

New columns added to support OAuth2:

```sql
-- OAuth2 provider IDs
google_id VARCHAR(255) UNIQUE;
microsoft_id VARCHAR(255) UNIQUE;

-- Authentication provider (LOCAL, GOOGLE, MICROSOFT)
auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

-- Profile picture from OAuth2 provider
profile_picture_url VARCHAR(500);

-- Password is now nullable (OAuth2 users don't have passwords)
password VARCHAR(255) NULL;
```

**Migration:** `V4__Add_OAuth2_Support.sql`

## User Experience

### Login Page

The login page now features:

1. **Traditional login form** (username/password) at the top
2. **"OR" divider** for visual separation
3. **"Sign in with Google" button** with official Google branding
4. **Microsoft OAuth** (coming soon, feature-flagged)

### First-Time Google Sign-In

When a user signs in with Google for the first time:

1. User clicks "Sign in with Google"
2. Google popup asks for email and profile permissions
3. User approves
4. **New account is created automatically**:
   - Email from Google
   - Name from Google
   - Username generated from email (e.g., `john.doe` from `john.doe@gmail.com`)
   - Google ID stored for future logins
   - Profile picture synced from Google
   - Role set to `USER` by default
   - No password (OAuth2 only)
5. Welcome email sent (if email service configured)
6. User redirected to dashboard with JWT token

### Existing User Linking

If a user already has a local account with the same email:

1. User signs in with Google
2. Backend finds existing user by email
3. **Google account is linked to existing user**:
   - Google ID added to user record
   - Auth provider updated to GOOGLE
   - Profile picture synced
   - Existing username, role, and permissions preserved
4. User logs in with their existing account + Google OAuth

### Subsequent Sign-Ins

After initial setup:

1. User clicks "Sign in with Google"
2. Google automatically signs in (if already logged into Google)
3. Backend finds user by Google ID
4. JWT token issued
5. User redirected to dashboard

## Security

### Token Verification

- **Google ID tokens are verified** using Google's official verification library
- **Token signature is checked** against Google's public keys
- **Audience (client ID) is validated** to prevent token reuse
- **Expiration time is checked** - expired tokens are rejected
- **Issuer is verified** - must be `accounts.google.com`

### User Data Protection

- **No password storage** for OAuth2 users - passwords are nullable
- **Profile pictures are URLs only** - no image data stored locally
- **Google IDs are unique** - database constraint prevents duplicates
- **Email verification is inherited** from Google (Google verifies emails)

### JWT Token Issuance

After successful Google authentication:

- **Standard JWT token is issued** (same as local authentication)
- **Token contains username and role** for authorization
- **15-minute expiration** for access tokens
- **7-day expiration** for refresh tokens
- **Same authorization logic** - Google users have same permissions as local users

## Troubleshooting

### "Invalid Google ID token" Error

**Cause:** Token verification failed

**Solutions:**
1. Check that `GOOGLE_CLIENT_ID` matches the client ID from Google Cloud Console
2. Verify that the token hasn't expired
3. Ensure Google API client library is included in dependencies
4. Check backend logs for detailed error message

### "Failed to authenticate with Google" Error

**Cause:** Backend couldn't process the Google response

**Solutions:**
1. Check backend logs for stack trace
2. Verify database connection (user table must exist)
3. Ensure email service is configured (for welcome emails)
4. Check that User entity has OAuth2 fields

### Google Button Not Appearing

**Cause:** Google Identity Services script not loaded

**Solutions:**
1. Check browser console for script loading errors
2. Verify `VITE_GOOGLE_CLIENT_ID` is set in frontend environment
3. Check network tab for failed requests to `accounts.google.com`
4. Try clearing browser cache and reloading

### "User already exists" Error

**Cause:** Attempt to create duplicate user

**Solutions:**
- This shouldn't happen - backend automatically links accounts
- Check backend logs for detailed error
- Verify database unique constraints are correct

### Popup Blocked

**Cause:** Browser blocked Google sign-in popup

**Solutions:**
1. Check browser address bar for popup blocker icon
2. Allow popups for your application domain
3. Try using a different browser
4. Check if third-party cookies are blocked

## Testing

### Manual Testing

1. **Start backend:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to login page:** `http://localhost:5173/login`

4. **Click "Sign in with Google"**

5. **Verify:**
   - Google popup appears
   - After approval, redirected to dashboard
   - User information displayed correctly
   - Profile picture loaded from Google
   - JWT token stored in auth context

### API Testing with cURL

```bash
# Get a Google ID token (use browser console)
# After clicking "Sign in with Google", intercept the token

# Test authentication
curl -X POST http://localhost:8080/api/v1/auth/oauth2/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ID_TOKEN_HERE"
  }'

# Expected response: JWT token + user info
```

### Check OAuth2 Status

```bash
curl http://localhost:8080/api/v1/auth/oauth2/status

# Expected response:
# {
#   "providers": {
#     "google": { "enabled": true, "status": "available" },
#     "microsoft": { "enabled": false, "status": "coming_soon" }
#   }
# }
```

## Frontend Integration

### GoogleLoginButton Component

Location: `frontend/src/components/auth/GoogleLoginButton.jsx`

**Features:**
- Loads Google Identity Services script dynamically
- Renders official Google button with branding
- Handles token exchange with backend
- Updates auth state and navigates to dashboard
- Error handling with user-friendly messages

**Usage:**

```jsx
import GoogleLoginButton from './GoogleLoginButton.jsx';

<GoogleLoginButton
  disabled={false}
  onError={(error) => setFormError(error)}
  onLoading={setGoogleLoading}
/>
```

### Login Page Integration

The Google button is integrated into the login page with:

- **OR divider** for visual separation
- **Consistent styling** with other buttons
- **Disabled state** when backend is offline or during loading
- **Error display** using existing error message component

## Performance

- **Fast authentication** - Token verification takes ~100-200ms
- **No password hashing** for OAuth2 users - faster user creation
- **Cached Google public keys** - Google's library handles caching
- **Single database query** for user lookup (by Google ID or email)
- **Asynchronous welcome email** - doesn't block login flow

## Future Enhancements

### Planned Features

1. **Microsoft OAuth / Azure AD** - Coming in next release
2. **Profile picture upload** - Allow local override of OAuth2 picture
3. **Multiple OAuth providers** - Link multiple providers to one account
4. **OAuth2 account unlinking** - Remove OAuth2 provider from account
5. **Admin OAuth management** - View OAuth provider usage statistics

### Integration Ideas

- **Google Workspace sync** - Sync organization, department from Google Directory
- **Google Calendar integration** - Link maintenance schedules to calendar
- **Google Drive integration** - Attach documents to assets
- **Google Photos integration** - Store asset photos

## Support

For issues or questions:

- **Backend logs:** Check `backend/logs/application.json` for detailed errors
- **Frontend console:** Check browser console for frontend errors
- **Google Cloud Console:** Verify OAuth2 client configuration
- **Database:** Check `users` table for auth_provider and google_id columns

## Summary

Google OAuth 2.0 integration provides a seamless, secure authentication experience for users. With automatic account creation, profile syncing, and secure token verification, users can sign in with a single click without remembering additional passwords. The integration is production-ready and follows OAuth2 best practices.

**Integration Status:** ✅ **Available Now** (v1.1.0)
