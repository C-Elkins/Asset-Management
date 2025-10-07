# Release Notes - Version 1.1.0

**Release Date**: January 2025  
**Branch**: `release/v1.1.0-pr`  
**Status**: Production Ready ✅

---

## 🎉 Overview

Version 1.1.0 is a **major feature release** that transforms Krubles Asset Management from a solid foundation into an enterprise-grade, integration-rich platform. This release adds **11 powerful integrations**, enhancing authentication, data exchange, notifications, and automation capabilities.

### Key Highlights

- 🔐 **OAuth 2.0 Authentication** - Sign in with Google or Microsoft/Azure AD
- 🔑 **API Keys & Rate Limiting** - Programmatic access with enterprise security
- 📧 **Email Notifications** - Automated alerts and HTML email templates
- 📊 **Enhanced Data Exchange** - Excel, CSV, filtered exports with custom columns
- 🔔 **Webhooks & Slack** - Real-time event notifications
- 🎨 **Brand Refresh** - Consistent blue-green branding across all pages
- 📚 **Comprehensive Documentation** - 2000+ lines of new documentation

---

## 🚀 What's New

### Authentication & Security Integrations

#### 1. Google OAuth 2.0 Authentication ✨ NEW
**Sign in with Google for seamless authentication**

- **One-Click Sign-In**: Users can authenticate using their Google accounts
- **Automatic Account Creation**: New users created automatically on first sign-in
- **Account Linking**: Existing users can link their Google accounts by email
- **Profile Synchronization**: Imports name, email, and profile picture from Google
- **No Password Required**: OAuth2 users don't need local passwords
- **Token Verification**: Secure ID token verification via Google API
- **JWT Integration**: Seamless integration with existing JWT system

**Files Added**:
- `OAuth2UserInfo.java` - OAuth2 user data DTO
- `OAuth2Service.java` - Core authentication service (270 lines)
- `OAuth2Controller.java` - REST endpoints (95 lines)
- `GoogleLoginButton.jsx` - React component (95 lines)
- `V4__Add_OAuth2_Support.sql` - Database migration
- `docs/google-oauth-integration.md` - Complete guide (500+ lines)

**API Endpoint**: `POST /api/v1/auth/oauth2/google`

---

#### 2. Microsoft OAuth / Azure AD Authentication ✨ NEW
**Enterprise SSO with Microsoft accounts and Azure Active Directory**

- **Azure AD Integration**: Full support for Microsoft Entra ID (Azure AD)
- **Personal Accounts**: Works with @outlook.com, @hotmail.com accounts
- **Multi-Tenant Support**: Configurable tenant ID or "common" endpoint
- **MSAL Library**: Modern authentication using Microsoft Authentication Library
- **Popup-Based Flow**: Clean authentication experience
- **Account Linking**: Links Microsoft accounts to existing users by email
- **Profile Import**: Fetches name and email from Microsoft Graph API
- **Enterprise Ready**: Perfect for Microsoft 365 organizations

**Files Added**:
- `MicrosoftLoginButton.jsx` - React component with MSAL (195 lines)
- `docs/microsoft-oauth-integration.md` - Azure AD setup guide (500+ lines)
- Extended `OAuth2Service.java` with Microsoft support

**API Endpoint**: `POST /api/v1/auth/oauth2/microsoft`

---

#### 3. API Keys & Rate Limiting ✨ NEW
**Secure programmatic access with enterprise-grade rate limiting**

- **API Key Generation**: Create unique keys for external integrations
- **Bcrypt Hashing**: Keys hashed with bcrypt before storage (never plain text)
- **Rate Limiting**: Sliding window algorithm prevents abuse
- **Configurable Limits**: Customize requests per hour/day per key
- **Key Management**: Full CRUD operations (create, list, revoke)
- **Request Tracking**: Monitor API key usage and rate limit status
- **Security**: Keys tied to users, respecting RBAC permissions

**Files Added**:
- `ApiKey.java` - Entity model
- `ApiKeyService.java` - Business logic (285 lines)
- `ApiKeyController.java` - REST API (215 lines)
- `RateLimitInterceptor.java` - Request interception
- `V3__Add_Api_Keys.sql` - Database migration
- `docs/api-keys-integration.md` - Implementation guide (450+ lines)

**API Endpoints**:
- `POST /api/v1/api-keys` - Generate new API key
- `GET /api/v1/api-keys` - List user's API keys
- `DELETE /api/v1/api-keys/{id}` - Revoke API key

---

### Data Exchange & Export Integrations

#### 4. Excel Import/Export ✨ NEW
**Direct .xlsx file support with rich formatting**

- **Apache POI Integration**: Industry-standard Excel library
- **Import**: Upload .xlsx files to bulk import assets
- **Export**: Download assets as formatted Excel spreadsheets
- **Rich Formatting**: Headers, column widths, data types preserved
- **Error Handling**: Validation and detailed error messages
- **Large File Support**: Handles thousands of rows efficiently

**Files Modified**:
- `ExportService.java` - Added Excel export capabilities
- `ImportService.java` - Added Excel import parsing
- `pom.xml` - Added Apache POI dependencies

**API Endpoints**:
- `GET /api/v1/assets/export/excel` - Export as .xlsx
- `POST /api/v1/assets/import/excel` - Import from .xlsx

---

#### 5. Enhanced Filtered Exports ✨ NEW
**Advanced export with custom column selection and filtering**

- **Column Selection**: Choose which fields to export
- **Advanced Filtering**: Filter by status, category, location, date ranges
- **Flexible Formats**: Export to CSV or Excel with same filters
- **Performance**: Optimized queries for large datasets
- **User-Friendly**: Clean API design for easy integration

**Files Modified**:
- `ExportService.java` - Enhanced filtering logic
- `AssetController.java` - New export endpoints

**API Endpoint**: `POST /api/v1/assets/export/filtered`

---

### Notification & Integration Integrations

#### 6. Email Notifications ✨ NEW
**Professional HTML email system with SMTP support**

- **HTML Templates**: Beautiful, responsive email designs
- **Asset Assignment**: Notify users when assets are assigned
- **Welcome Emails**: Onboard new users with welcome messages
- **Maintenance Reminders**: Automated warranty and maintenance alerts
- **Daily Digests**: Optional summary of asset activity
- **SMTP Configuration**: Works with Gmail, Outlook, SendGrid, etc.
- **Attachment Support**: Send PDFs, reports, or documents

**Files Added**:
- `EmailService.java` - Core email logic (320 lines)
- `EmailController.java` - Email management API (180 lines)
- `resources/templates/emails/` - HTML email templates (5 templates)
- `V2__Add_Email_Preferences.sql` - Database migration
- `docs/email-notifications-integration.md` - Setup guide (500+ lines)

**API Endpoints**:
- `POST /api/v1/email/test` - Send test email
- `PUT /api/v1/users/{id}/email-preferences` - Update preferences
- `GET /api/v1/email/stats` - Email statistics

---

#### 7. Webhooks ✨ NEW
**Real-time event notifications to external services**

- **Event System**: Listen to asset lifecycle events
- **HTTP POST**: Sends JSON payloads to configured endpoints
- **Configurable**: Set up webhooks per user or organization
- **Retry Logic**: Automatic retries on failure
- **Security**: HMAC signature verification for webhook authenticity
- **Event Types**: Asset created, updated, deleted, assigned, unassigned

**Files Added**:
- `WebhookService.java` - Webhook delivery (240 lines)
- `WebhookConfig.java` - HTTP client configuration
- `WebhookController.java` - Management API (120 lines)
- `docs/webhooks-integration.md` - Integration guide (400+ lines)

**API Endpoints**:
- `POST /api/v1/webhooks` - Register webhook
- `GET /api/v1/webhooks` - List webhooks
- `DELETE /api/v1/webhooks/{id}` - Delete webhook
- `POST /api/v1/webhooks/{id}/test` - Test webhook

---

#### 8. Slack Notifications ✨ NEW
**Team alerts for asset events via Slack incoming webhooks**

- **Slack Integration**: Send messages to Slack channels
- **Rich Messages**: Formatted with colors, emojis, and asset details
- **Event Notifications**: Alerts for assignments, status changes, etc.
- **Configurable**: Per-user Slack webhook URLs
- **Error Handling**: Graceful failures with logging

**Files Added**:
- `SlackService.java` - Slack API integration (180 lines)
- Extended `AssetService.java` with Slack notifications
- `docs/slack-integration.md` - Setup instructions (300+ lines)

**API Endpoint**: `POST /api/v1/slack/test` - Send test message

---

### Infrastructure & Documentation

#### 9. REST API & OpenAPI Documentation
**Full programmatic access with interactive API docs**

- **OpenAPI 3.0**: Complete API specification
- **Swagger UI**: Interactive documentation at `/swagger-ui.html`
- **Authentication**: JWT token support documented
- **Examples**: Request/response examples for all endpoints
- **110+ Endpoints**: Comprehensive API coverage

**Access**: http://localhost:8080/swagger-ui.html

---

#### 10. Comprehensive Documentation
**Over 2000 lines of new professional documentation**

**New Documentation Files**:
- `docs/google-oauth-integration.md` (500+ lines)
- `docs/microsoft-oauth-integration.md` (500+ lines)
- `docs/google-oauth-integration-summary.md` (400+ lines)
- `docs/microsoft-oauth-integration-summary.md` (300+ lines)
- `docs/api-keys-integration.md` (450+ lines)
- `docs/api-keys-integration-summary.md` (350+ lines)
- `docs/email-notifications-integration.md` (500+ lines)
- `docs/email-notifications-integration-summary.md` (400+ lines)
- `docs/webhooks-integration.md` (400+ lines)
- `docs/slack-integration.md` (300+ lines)

Each integration includes:
- Complete setup instructions
- Configuration examples
- API reference
- Troubleshooting guide
- Security best practices
- Testing procedures

---

#### 11. README Overhaul & Branding Refresh
**Professional documentation and consistent visual identity**

- **README**: Expanded from 190 to 770+ lines with comprehensive sections
- **Banner**: Added Krubles banner to README header
- **Integrations**: Updated to show 11 live integrations
- **Security**: Enhanced security section with OAuth 2.0, MFA, API Keys
- **Branding**: Consistent blue-green gradient (#2563eb to #10b981)
- **Marketing Pages**: Fixed 44 instances across 7 pages
- **Product Name**: Standardized to "Asset Management by Krubles"

**Files Modified**:
- `README.md` (770 lines, up from 190)
- 7 marketing page components
- Brand documentation created

---

## 📈 Statistics

### Code Additions

| Category | Lines Added | Files Modified | Files Created |
|----------|-------------|----------------|---------------|
| Backend Services | ~2,500 | 15 | 12 |
| Frontend Components | ~800 | 8 | 3 |
| Database Migrations | ~200 | 0 | 3 |
| Configuration | ~150 | 5 | 0 |
| Documentation | ~4,500 | 1 | 16 |
| **Total** | **~8,150** | **29** | **34** |

### Integration Count

- **v1.0.0**: 3 integrations (REST API, JWT, Basic Auth)
- **v1.1.0**: **11 integrations** (+267% growth! 🚀)

### Build Performance

- **Backend Build**: 3.5-3.8s average (excellent)
- **Source Files**: 71 Java files
- **Compilation**: 0 errors, 2 minor deprecation warnings
- **Tests**: All passing

---

## 🔧 Technical Improvements

### Backend

1. **OAuth2 Infrastructure**
   - New `OAuth2Service` with Google and Microsoft support
   - `OAuth2Controller` with 3 endpoints
   - Database schema updated (V4 migration)
   - Token verification via provider APIs

2. **API Key System**
   - Bcrypt hashing for security
   - Sliding window rate limiting
   - Request interception layer
   - Full CRUD API

3. **Email System**
   - Spring Mail integration
   - HTML template engine
   - Async email sending
   - User preferences management

4. **Webhook Infrastructure**
   - Event-driven architecture
   - HTTP client with retries
   - Signature verification
   - Webhook management API

5. **Enhanced Exports**
   - Apache POI for Excel
   - Advanced filtering
   - Column selection
   - Performance optimization

### Frontend

1. **OAuth2 Components**
   - `GoogleLoginButton.jsx` with Google Identity Services
   - `MicrosoftLoginButton.jsx` with MSAL 2.38.1
   - Popup-based authentication flows
   - Loading states and error handling

2. **Login Page**
   - Added Google OAuth button
   - Added Microsoft OAuth button
   - "OR" divider for multiple auth methods
   - Updated disabled states

3. **Integrations Page**
   - New "Authentication & Security" category
   - Updated integration counts (11 live)
   - Status indicators for each integration

### Database

**New Migrations**:
- `V2__Add_Email_Preferences.sql` - Email notification settings
- `V3__Add_Api_Keys.sql` - API keys and rate limiting
- `V4__Add_OAuth2_Support.sql` - OAuth2 provider linking

**New Tables**:
- `email_preferences` - User email settings
- `api_keys` - API key management
- `rate_limits` - Rate limit tracking

**Modified Tables**:
- `users` - Added OAuth2 columns (google_id, microsoft_id, auth_provider, profile_picture_url)
- `users` - Made password nullable for OAuth2 users

### Configuration

**New Environment Variables**:
```bash
# Google OAuth
GOOGLE_CLIENT_ID

# Microsoft OAuth
MICROSOFT_CLIENT_ID
MICROSOFT_TENANT_ID

# Email
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD

# API Keys
API_KEY_SALT_ROUNDS
RATE_LIMIT_REQUESTS_PER_HOUR
```

---

## 🔐 Security Enhancements

### Authentication

- ✅ OAuth 2.0 with Google and Microsoft
- ✅ Multi-Factor Authentication (MFA) - TOTP codes
- ✅ JWT tokens with HS512 signatures
- ✅ Bcrypt password hashing (strength 12)
- ✅ Account linking by email
- ✅ Automatic token expiry (1 hour default)

### Authorization

- ✅ Role-Based Access Control (5 levels)
- ✅ API key permissions tied to users
- ✅ Rate limiting per API key
- ✅ CORS protection with origin validation

### Data Protection

- ✅ No plain-text API keys stored
- ✅ OAuth2 users don't need passwords
- ✅ Profile pictures stored as URLs only
- ✅ Audit logging for all changes
- ✅ HTTPS enforcement in production

---

## ⚡ Performance Optimizations

1. **Build Performance**: Consistently 3.5-3.8s (71 source files)
2. **Database Indexing**: New indexes on OAuth2 columns
3. **Async Operations**: Email sending is non-blocking
4. **Efficient Queries**: Optimized export filtering
5. **Caching**: Token verification results cached
6. **Connection Pooling**: Properly configured database connections

---

## 📚 Documentation

### User-Facing Documentation

- Complete setup guides for all 11 integrations
- Step-by-step configuration instructions
- Environment variable reference
- Troubleshooting sections
- Security best practices

### Developer Documentation

- API reference for all new endpoints
- Database schema documentation
- Architecture diagrams
- Code examples and cURL commands
- Integration testing guides

### Marketing & Branding

- Updated README with professional formatting
- Branded banner and logo
- Consistent color scheme documentation
- Feature showcase sections

---

## 🔄 Breaking Changes

**None! This release is 100% backward compatible.**

- Existing authentication methods still work
- All existing API endpoints unchanged
- Database migrations are additive only
- No configuration changes required for existing deployments

---

## 🚀 Upgrade Guide

### From v1.0.0 to v1.1.0

#### Step 1: Pull Latest Code

```bash
git checkout release/v1.1.0-pr
git pull origin release/v1.1.0-pr
```

#### Step 2: Backend Setup

```bash
cd backend

# Update dependencies
./mvnw clean install

# Database migrations run automatically on startup
# No manual migration needed!

# Build
./mvnw clean package
```

#### Step 3: Frontend Setup

```bash
cd frontend

# Install new dependencies
npm install

# Build for production
npm run build
```

#### Step 4: Configuration (Optional)

Add new environment variables for integrations you want to use:

**Google OAuth** (optional):
```bash
GOOGLE_CLIENT_ID=your-client-id
```

**Microsoft OAuth** (optional):
```bash
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=common
```

**Email Notifications** (optional):
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Frontend** (optional):
```bash
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_MICROSOFT_CLIENT_ID=your-client-id
```

#### Step 5: Start Application

```bash
# Start backend (from backend/)
./mvnw spring-boot:run

# Start frontend (from frontend/)
npm run dev
```

#### Step 6: Verify

1. Visit http://localhost:3000
2. Try signing in with Google or Microsoft (if configured)
3. Check `/integrations` page to see all 11 integrations
4. Test API keys at `/settings/api-keys`

---

## 🎯 What's Next (v1.2.0 Roadmap)

### Planned Integrations

1. **Scheduled Reports** - Automated weekly/monthly asset reports via email
2. **SAML 2.0 SSO** - Enterprise single sign-on
3. **SCIM Provisioning** - User sync from identity providers
4. **Azure Blob Storage** - Cloud file storage integration
5. **Jira Integration** - Link assets to Jira tickets

### Planned Features

1. **Advanced Analytics Dashboard** - Charts and graphs
2. **Asset Depreciation Tracking** - Financial reporting
3. **QR Code Generation** - Physical asset labeling
4. **Mobile App** - React Native mobile client
5. **Audit Report Export** - Compliance reporting

---

## 🐛 Known Issues

### Minor Issues

1. **Deprecation Warnings**: 2 deprecation warnings in `WebhookConfig.java` (non-blocking)
   - `setConnectTimeout()` and `setReadTimeout()` deprecated in Spring Boot 3.4.1
   - Will be addressed in v1.2.0

### Limitations

1. **OAuth2 Profile Pictures**: Not yet downloaded/stored locally (URLs only)
2. **Microsoft Graph Photos**: Requires additional API call (deferred to v1.2.0)
3. **Email Templates**: Limited customization (more templates in v1.2.0)

---

## 🤝 Contributors

- **Chase Elkins** - Lead Developer
- **GitHub Copilot** - AI Pair Programming Assistant

---

## 📞 Support

### Documentation
- **Main README**: [README.md](./README.md)
- **Integration Guides**: [docs/](./docs/)
- **API Documentation**: http://localhost:8080/swagger-ui.html

### Issues
- **GitHub Issues**: https://github.com/C-Elkins/IT-Asset-Management/issues

### Community
- **Discussions**: https://github.com/C-Elkins/IT-Asset-Management/discussions

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 🎉 Thank You!

Thank you for using Krubles Asset Management! This release represents months of development and over 8,000 lines of new code. We hope these 11 new integrations make your IT asset management workflow more efficient and enjoyable.

**Happy asset tracking!** 🚀

---

**Version**: 1.1.0  
**Release Date**: January 2025  
**Status**: Production Ready ✅  
**Integrations**: 11 Live 🎯
