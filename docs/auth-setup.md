# Authentication Setup Guide

This doc summarizes the endpoints, environment variables, and flows to enable
full authentication on the platform.

## Frontend

- Env flags:
  - `VITE_API_BASE_URL` (e.g. <http://localhost:8080/api/v1>)
  - `VITE_FEATURE_SSO_MICROSOFT=1` (enables the Microsoft SSO button on login)
  - `VITE_SSO_MICROSOFT_AUTH_URL` (optional; overrides default `/oauth2/authorization/azure`)

- Headers automatically sent by axios:
  - `Authorization: Bearer <JWT>`
  - `X-Correlation-Id: <uuid>`
  - `X-Tenant-Id: <tenant>` if `localStorage.tenant_id` is set

- Primary pages:
  - Login, Signup, Forgot Password, Reset Password
  - Security Settings (MFA TOTP)
  - API Settings (JWT copy, claims, tenant selector)

## Backend endpoints (expected)

- `POST /auth/login` → `{ accessToken, refreshToken?, user?, expiresIn? }`
- `POST /auth/refresh` (uses `X-Refresh-Token` header)
- `POST /auth/logout` (optional; include `X-Refresh-Token`)
- `GET /auth/me` → current user info
- `POST /auth/register` → register account
- `POST /auth/forgot-password` → email magic link or token
- `POST /auth/reset-password` → `{ token, newPassword }`
- `POST /auth/mfa/totp/enroll` → `{ secret, qrCodeDataUri }`
- `POST /auth/mfa/totp/verify` → `{ code }`
- `GET /actuator/health` (Spring Boot health)
- Optional SSO:
  - `GET /oauth2/authorization/azure` → redirect to Microsoft login
  - `GET /login/oauth2/code/azure` → provider callback

## Security notes

- Prefer HttpOnly, Secure, SameSite cookies for refresh tokens in production.
- Keep access tokens short‑lived; use refresh for silent re-auth.
- Enforce tenant isolation via `X-Tenant-Id` and server-side authorization checks.
- Rate-limit auth endpoints and add IP throttling.

## MFA (TOTP)

1. User opens Security Settings → TOTP Setup.
2. Frontend calls `/auth/mfa/totp/enroll` and renders QR code.
3. User scans the code in an authenticator app and inputs the 6-digit code.
4. Frontend calls `/auth/mfa/totp/verify` with `{ code }` to enable MFA.

## SSO (Microsoft)

1. Set `VITE_FEATURE_SSO_MICROSOFT=1` in the frontend env.
2. Configure OIDC client in backend for Azure AD/Entra.
3. Frontend “Sign in with Microsoft” button navigates to
  `/oauth2/authorization/azure` or the value in
  `VITE_SSO_MICROSOFT_AUTH_URL`.
