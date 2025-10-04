# Microsoft OAuth / Azure AD Integration

## Overview

The IT Asset Management System now supports **Microsoft OAuth 2.0** authentication through Azure Active Directory (Azure AD), allowing users to sign in with their Microsoft accounts. This integration provides seamless authentication for enterprise environments using Microsoft 365, Azure AD, or personal Microsoft accounts.

### Key Features

- **Enterprise-Ready**: Full Azure AD / Entra ID support for organizations
- **Personal Accounts**: Works with personal Microsoft accounts (@outlook.com, @hotmail.com)
- **Popup-Based Flow**: Uses MSAL (Microsoft Authentication Library) for modern auth experience
- **Automatic Account Linking**: Connects Microsoft accounts to existing users by email
- **Profile Synchronization**: Imports name and email from Microsoft Graph API
- **Tenant Support**: Configurable tenant ID or multi-tenant "common" endpoint
- **Secure Token Exchange**: Microsoft access tokens exchanged for JWT
- **No Password Storage**: OAuth2 users don't require local passwords

## Architecture

### Authentication Flow

```
┌──────────┐           ┌────────────────┐          ┌─────────────┐
│  User    │           │   Frontend     │          │   Backend   │
│ Browser  │           │  React App     │          │  Spring Boot│
└────┬─────┘           └────────┬───────┘          └──────┬──────┘
     │                          │                         │
     │  Click "Sign in with    │                         │
     │  Microsoft" button      │                         │
     ├────────────────────────>│                         │
     │                          │                         │
     │  Load MSAL library       │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │  Open Microsoft login    │                         │
     │  popup (Azure AD)        │                         │
     ├────────────────────────>│                         │
     │                          │                         │
     │  User authenticates      │                         │
     │  with Microsoft          │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │  Access token returned   │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │                          │  POST /auth/oauth2/     │
     │                          │  microsoft {accessToken}│
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │  Verify token with      │
     │                          │  Microsoft Graph API    │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │  Get user profile       │
     │                          │  (/me endpoint)         │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │  Find or create user    │
     │                          │  Generate JWT           │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │  Return JWT + user data │
     │                          │<────────────────────────┤
     │                          │                         │
     │  Redirect to dashboard   │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
```

### Microsoft Graph API Integration

The backend uses Microsoft Graph API `/me` endpoint to fetch user profile information:

- **User ID**: Unique Microsoft account identifier
- **Email**: Primary email (mail or userPrincipalName)
- **First Name**: Given name from profile
- **Last Name**: Surname from profile
- **Verification**: All Microsoft accounts treated as verified

## Configuration

### Azure AD App Registration

1. **Navigate to Azure Portal**
   - Go to https://portal.azure.com
   - Navigate to "Azure Active Directory" or "Microsoft Entra ID"

2. **Create App Registration**
   - Click "App registrations" → "New registration"
   - **Name**: IT Asset Management System
   - **Supported account types**: Choose one:
     - "Accounts in this organizational directory only" (Single tenant)
     - "Accounts in any organizational directory" (Multi-tenant)
     - "Accounts in any organizational directory and personal Microsoft accounts" (Multi-tenant + personal)
   - **Redirect URI**: 
     - Platform: "Single-page application (SPA)"
     - URI: `http://localhost:3000/auth/microsoft/callback` (development)
     - URI: `https://yourdomain.com/auth/microsoft/callback` (production)
   - Click "Register"

3. **Configure Authentication**
   - Go to "Authentication" section
   - Under "Implicit grant and hybrid flows":
     - ✅ Check "Access tokens (used for implicit flows)"
     - ✅ Check "ID tokens (used for implicit and hybrid flows)"
   - Under "Advanced settings":
     - Allow public client flows: No
   - Click "Save"

4. **Add API Permissions**
   - Go to "API permissions" section
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Add these permissions:
     - ✅ `openid` (Sign users in)
     - ✅ `profile` (View users' basic profile)
     - ✅ `email` (View users' email address)
     - ✅ `User.Read` (Read user profile)
   - Click "Add permissions"
   - (Optional) Click "Grant admin consent" if you're an admin

5. **Get Client ID and Tenant ID**
   - On "Overview" page, copy:
     - **Application (client) ID**: e.g., `12345678-1234-1234-1234-123456789abc`
     - **Directory (tenant) ID**: e.g., `87654321-4321-4321-4321-987654321cba`
     - (Or use "common" for multi-tenant apps)

6. **Optional: Create Client Secret** (for future use)
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: "IT Asset Management Backend"
   - Expires: Choose duration (12 months recommended)
   - Click "Add"
   - **Copy the secret value immediately** (you won't see it again)

### Backend Configuration

Add to `application.yml`:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          microsoft:
            client-id: ${MICROSOFT_CLIENT_ID:}
            client-secret: ${MICROSOFT_CLIENT_SECRET:}
            scope:
              - openid
              - profile
              - email
              - User.Read
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/api/v1/auth/oauth2/callback/microsoft"
            client-name: Microsoft
        provider:
          microsoft:
            authorization-uri: https://login.microsoftonline.com/${MICROSOFT_TENANT_ID:common}/oauth2/v2.0/authorize
            token-uri: https://login.microsoftonline.com/${MICROSOFT_TENANT_ID:common}/oauth2/v2.0/token
            user-info-uri: https://graph.microsoft.com/v1.0/me
            user-name-attribute: id
```

#### Environment Variables

Set these environment variables:

```bash
# Required
export MICROSOFT_CLIENT_ID="12345678-1234-1234-1234-123456789abc"

# Optional (use "common" for multi-tenant)
export MICROSOFT_TENANT_ID="common"  # or your specific tenant ID

# Optional (for future server-side flows)
export MICROSOFT_CLIENT_SECRET="your-client-secret-here"
```

### Frontend Configuration

Add to `.env` (development):

```bash
VITE_MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
VITE_MICROSOFT_TENANT_ID=common
```

Add to `.env.production` (production):

```bash
VITE_MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
VITE_MICROSOFT_TENANT_ID=your-tenant-id-or-common
```

**Important**: The frontend client ID must match your Azure AD app registration.

## API Reference

### Authenticate with Microsoft

Exchange a Microsoft access token for a JWT.

**Endpoint**: `POST /api/v1/auth/oauth2/microsoft`

**Request Body**:
```json
{
  "accessToken": "EwAoA8l6BAAURSN/FHlDW5xN74t..."
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyMTIzIiwiaW...",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "authProvider": "MICROSOFT",
    "profilePictureUrl": null
  },
  "message": "Successfully authenticated with Microsoft"
}
```

**Error Responses**:

- **400 Bad Request**: Missing access token
  ```json
  {
    "error": "Missing access token",
    "message": "Access token is required"
  }
  ```

- **401 Unauthorized**: Invalid access token
  ```json
  {
    "error": "Invalid Microsoft access token",
    "message": "Token verification failed"
  }
  ```

- **500 Internal Server Error**: Authentication failed
  ```json
  {
    "error": "Authentication failed",
    "message": "An unexpected error occurred"
  }
  ```

### Check OAuth2 Status

Get availability status of OAuth2 providers.

**Endpoint**: `GET /api/v1/auth/oauth2/status`

**Success Response** (200 OK):
```json
{
  "providers": {
    "google": {
      "enabled": true,
      "status": "available"
    },
    "microsoft": {
      "enabled": true,
      "status": "available"
    }
  }
}
```

## Database Schema

### Modified `users` Table

The Microsoft OAuth integration uses the same OAuth2 columns added for Google:

| Column              | Type         | Constraints | Description                    |
|---------------------|--------------|-------------|--------------------------------|
| microsoft_id        | VARCHAR(255) | UNIQUE      | Microsoft account ID           |
| auth_provider       | VARCHAR(50)  | NOT NULL    | MICROSOFT, GOOGLE, or LOCAL    |
| profile_picture_url | VARCHAR(500) | NULL        | Profile picture URL            |
| password            | VARCHAR(255) | NULL        | Nullable for OAuth2 users      |

**Migration**: `V4__Add_OAuth2_Support.sql` (already applied)

**Indexes**:
- `idx_users_microsoft_id` - Fast Microsoft account lookup
- `idx_users_auth_provider` - Filter by authentication method

## User Experience

### Login Page

The login page displays three authentication options:

1. **Traditional Login** (username + password)
2. **Google Sign-In** (OAuth2 with Google)
3. **Microsoft Sign-In** (OAuth2 with Microsoft)

The Microsoft button features:
- Official Microsoft branding (four-color tile logo)
- "Sign in with Microsoft" text
- Loading spinner during authentication
- Disabled state when backend is offline

### First-Time Sign-In Flow

When a user signs in with Microsoft for the first time:

1. **Popup Opens**: MSAL opens Microsoft login popup
2. **User Authenticates**: User enters Microsoft credentials
3. **Permissions Consent**: User consents to profile access (first time only)
4. **Token Exchange**: Access token sent to backend
5. **Account Creation**: New account created automatically
6. **Profile Sync**: Name and email imported from Microsoft
7. **JWT Issued**: User receives JWT for our system
8. **Dashboard Access**: User redirected to dashboard

### Account Linking

If a user with the same email already exists:

- **First OAuth Sign-In**: Microsoft account linked to existing user
- **Future Sign-Ins**: User can sign in with either method
- **Profile Updates**: Microsoft profile updates local user info
- **Single User Record**: One user record, multiple auth methods

## Security Features

### Token Verification

1. **Access Token Validation**: Token verified via Microsoft Graph API
2. **Profile Fetch**: `/me` endpoint called to get user data
3. **Email Verification**: All Microsoft accounts treated as verified
4. **Token Expiry**: Short-lived access tokens (1 hour default)

### Authentication Security

- **No Password Storage**: OAuth2 users don't have local passwords
- **Secure Token Exchange**: Frontend never stores access tokens
- **JWT Generation**: Backend issues short-lived JWTs (1 hour)
- **HTTPS Required**: Production must use HTTPS for security
- **CORS Protected**: Backend validates request origins

### User Data Protection

- **Minimal Permissions**: Only essential profile data requested
- **No Sensitive Data**: Passwords, payment info not accessed
- **Profile Privacy**: Profile pictures optional, not stored locally
- **Account Isolation**: Microsoft account ID unique per user

## Troubleshooting

### Common Errors

#### "Microsoft login was cancelled"

**Cause**: User closed popup before completing login

**Solution**:
- User should click "Sign in with Microsoft" again
- Ensure popups are not blocked by browser

#### "Popup was blocked. Please allow popups for this site."

**Cause**: Browser blocked popup window

**Solution**:
1. Click popup blocker icon in address bar
2. Select "Always allow popups from this site"
3. Try signing in again

#### "Microsoft authentication is not configured"

**Cause**: `VITE_MICROSOFT_CLIENT_ID` not set in frontend

**Solution**:
```bash
# Add to .env file
VITE_MICROSOFT_CLIENT_ID=your-client-id-here
```

#### "Invalid Microsoft access token"

**Cause**: Token expired or invalid

**Solutions**:
- Check clock synchronization on client/server
- Verify Azure AD app registration is correct
- Ensure API permissions are granted
- Check tenant ID matches configuration

#### "Failed to sign in with Microsoft"

**Cause**: Network error or backend unavailable

**Solutions**:
- Check backend is running
- Verify CORS settings allow frontend domain
- Check backend logs for details
- Ensure Microsoft Graph API is accessible

### Backend Logs

Enable debug logging in `application.yml`:

```yaml
logging:
  level:
    com.chaseelkins.assetmanagement.service.OAuth2Service: DEBUG
    org.springframework.security: DEBUG
```

Log messages to look for:
- `"Authenticating user with Microsoft OAuth2"` - Request received
- `"Verifying Microsoft access token"` - Token validation started
- `"User {email} successfully authenticated with Microsoft"` - Success
- `"Error verifying Microsoft token"` - Token verification failed

### Testing Locally

1. **Start Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**: Navigate to http://localhost:3000

4. **Test Sign-In**:
   - Click "Sign in with Microsoft"
   - Use test Microsoft account
   - Verify redirect to dashboard
   - Check JWT token in localStorage

5. **Verify in Database**:
   ```sql
   SELECT id, username, email, microsoft_id, auth_provider
   FROM users
   WHERE auth_provider = 'MICROSOFT';
   ```

## Performance Considerations

### Token Verification Latency

- **Graph API Call**: 100-300ms average
- **Total Auth Time**: 1-2 seconds typical
- **Caching**: Not implemented (tokens are one-time use)
- **Optimization**: Token verification happens once per login

### MSAL Library Loading

- **Library Size**: ~150KB (minified)
- **CDN Delivery**: Loaded from Microsoft CDN
- **Caching**: Browser caches library across sessions
- **Performance**: Negligible impact on page load

## Future Enhancements

### Planned Features

1. **Profile Picture Sync**: Download and store Microsoft profile photos
2. **Group Membership**: Import Azure AD group memberships for roles
3. **Conditional Access**: Support Azure AD conditional access policies
4. **Multi-Tenant Improvements**: Better tenant-specific configuration
5. **Admin Consent Flow**: Pre-approval for organization-wide consent
6. **Account Unlinking**: Allow users to disconnect Microsoft account
7. **Refresh Tokens**: Implement refresh token flow for extended sessions

### Enterprise Features

- **SAML 2.0**: Alternative to OAuth2 for enterprise SSO
- **SCIM Provisioning**: Automatic user provisioning from Azure AD
- **Advanced Security**: Require MFA, device compliance
- **Audit Logging**: Enhanced logging for compliance
- **Role Mapping**: Sync Azure AD roles to application roles

## Related Documentation

- [Google OAuth Integration](./google-oauth-integration.md)
- [Authentication Setup](./auth-setup.md)
- [User Guide](./user-guide.md)
- [API Documentation](./api-documentation.md)

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/your-org/it-asset-management/issues
- **Azure AD Documentation**: https://docs.microsoft.com/en-us/azure/active-directory/
- **MSAL.js Documentation**: https://github.com/AzureAD/microsoft-authentication-library-for-js

---

**Last Updated**: January 2025  
**Integration Version**: 1.1.0  
**Status**: Production Ready ✅
