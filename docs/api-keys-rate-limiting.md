# API Keys & Rate Limiting Integration

## Overview
Secure your API with API keys and rate limiting. This integration allows users to generate API keys for external applications, with configurable rate limits to prevent abuse and ensure fair usage.

## Features

### API Key Management
- **Generate API Keys**: Create unique API keys with custom names and descriptions
- **Secure Storage**: Keys are hashed with bcrypt (never stored in plain text)
- **Prefix Visibility**: Only first 16 characters visible (e.g., `ak_test_abc12345...`)
- **One-Time Display**: Full key shown only once during creation
- **Lifecycle Management**: Activate, deactivate, or permanently delete keys
- **User Association**: Each key belongs to a specific user
- **Expiration**: Optional expiry dates for time-limited access

### Rate Limiting
- **Per-Key Limits**: Each API key has its own rate limit (default: 1,000 requests/hour)
- **Sliding Window**: Uses sliding window algorithm for accurate rate limiting
- **HTTP Headers**: Standard rate limit headers in responses
- **Memory Efficient**: Automatic cleanup of expired rate limit data
- **Configurable**: Customize limits per API key

### Security Features
- **Bcrypt Hashing**: API keys hashed with Spring Security's PasswordEncoder
- **Unique Prefixes**: Each key has a unique 16-character prefix for lookups
- **Expiration Support**: Keys can be configured to expire automatically
- **Active/Inactive Status**: Revoke keys without deletion
- **User Ownership**: Users can only manage their own keys (except admins)

## Architecture

### Components

1. **ApiKey Entity**: Stores API key metadata
   - ID, name, description
   - Key hash (bcrypt)
   - Prefix (first 16 chars for lookup)
   - User association
   - Rate limit configuration
   - Active status and expiry date
   - Usage tracking (last used timestamp)

2. **ApiKeyService**: Business logic for API key operations
   - Create, validate, update, delete keys
   - Hash verification
   - Ownership checks

3. **RateLimitService**: In-memory rate limiting
   - Sliding window algorithm
   - Per-identifier request tracking
   - Automatic cleanup of old data

4. **RateLimitInterceptor**: Request interception
   - Validates API keys from `X-API-Key` header
   - Enforces rate limits
   - Adds rate limit headers to responses
   - Returns 429 when limit exceeded

5. **ApiKeyController**: REST endpoints
   - CRUD operations for API keys
   - Ownership validation
   - Admin endpoints

## API Key Format

```
ak_[environment]_[random40chars]
```

- **Prefix**: `ak_` (API Key)
- **Environment**: `test` (dev) or `live` (prod)
- **Random Part**: 40 random hexadecimal characters

**Example**: `ak_test_a1b2c3d4e5f6789012345678901234567890abcd`

### Prefix (First 16 Characters)
The prefix is used for database lookups and is the only part visible after creation:
- **Example Prefix**: `ak_test_a1b2c3d4`
- Unique across all keys
- Used for fast lookups
- Shown in UI and logs

## Configuration

### Database Migration
The integration includes a Flyway migration (`V3__Add_Api_Keys.sql`) that creates:
- `api_keys` table with proper constraints
- Indexes for performance (user_id, prefix, active, expires_at)
- Foreign key to users table with CASCADE delete

### Spring Configuration
Rate limiting is automatically configured via:
- `@EnableScheduling` in main application class
- `RateLimitInterceptor` registered in `WebConfig`
- Scheduled cleanup task runs hourly

### Application Properties
```yaml
scheduling:
  rate-limit-cleanup:
    cron: "0 0 * * * *"  # Every hour
```

## API Endpoints

### Create API Key
```bash
POST /api/v1/api-keys
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Production App",
  "description": "API key for production mobile app",
  "rateLimit": 5000,
  "expiresAt": "2025-12-31T23:59:59"
}
```

**Response** (⚠️ Full key only shown once!):
```json
{
  "id": 1,
  "name": "Production App",
  "apiKey": "ak_test_a1b2c3d4e5f6789012345678901234567890abcd",
  "prefix": "ak_test_a1b2c3d4",
  "description": "API key for production mobile app",
  "rateLimit": 5000,
  "expiresAt": "2025-12-31T23:59:59",
  "createdAt": "2025-10-02T17:30:00"
}
```

### List User API Keys
```bash
GET /api/v1/api-keys
Authorization: Bearer <jwt-token>
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Production App",
    "prefix": "ak_test_a1b2c3d4",
    "description": "API key for production mobile app",
    "active": true,
    "rateLimit": 5000,
    "lastUsedAt": "2025-10-02T17:45:00",
    "expiresAt": "2025-12-31T23:59:59",
    "createdAt": "2025-10-02T17:30:00",
    "userId": 123,
    "userEmail": "user@example.com"
  }
]
```

### Get API Key by ID
```bash
GET /api/v1/api-keys/{id}
Authorization: Bearer <jwt-token>
```

### Update API Key
```bash
PUT /api/v1/api-keys/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "rateLimit": 10000,
  "expiresAt": "2026-12-31T23:59:59"
}
```

### Revoke API Key
```bash
POST /api/v1/api-keys/{id}/revoke
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "message": "API key revoked successfully",
  "id": "1"
}
```

### Delete API Key
```bash
DELETE /api/v1/api-keys/{id}
Authorization: Bearer <jwt-token>
```

### Admin: List All API Keys
```bash
GET /api/v1/api-keys/all
Authorization: Bearer <admin-jwt-token>
```

## Using API Keys

### In Requests
Include the API key in the `X-API-Key` header:

```bash
curl -X GET http://localhost:8080/api/v1/assets \
  -H "X-API-Key: ak_test_a1b2c3d4e5f6789012345678901234567890abcd"
```

### Rate Limit Headers
Every response includes rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1696275600
```

- **X-RateLimit-Limit**: Maximum requests allowed per hour
- **X-RateLimit-Remaining**: Requests remaining in current window
- **X-RateLimit-Reset**: Unix timestamp when limit resets

### Rate Limit Exceeded
When rate limit is exceeded, the API returns:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696275600
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "limit": 1000,
  "reset": 1696275600
}
```

## Rate Limiting Algorithm

### Sliding Window
The service uses a sliding window algorithm:

1. **Request Arrives**: Timestamp recorded
2. **Window Calculation**: Remove requests older than 1 hour
3. **Count Check**: Compare remaining requests to limit
4. **Decision**: Allow or reject request

**Window Duration**: 1 hour (3600 seconds)

### Memory Management
- In-memory storage using `ConcurrentHashMap`
- Automatic cleanup every hour
- Per-identifier tracking (API key prefix)
- Thread-safe operations

### Production Scaling
For production with multiple servers, consider:
- **Redis**: Distributed rate limiting
- **Redis Cluster**: High availability
- **Atomic Operations**: INCR, EXPIRE commands

## Security Best Practices

### API Key Creation
1. **Descriptive Names**: Use meaningful names (e.g., "Mobile App v2")
2. **Appropriate Limits**: Set realistic rate limits
3. **Expiration Dates**: Use expiry for temporary access
4. **Immediate Storage**: Save full key immediately (only shown once!)

### API Key Storage
1. **Secure Storage**: Store in environment variables or secrets manager
2. **Never Commit**: Don't commit keys to version control
3. **Rotation**: Rotate keys periodically
4. **Revocation**: Revoke compromised keys immediately

### Development vs Production
- **Development**: Use `ak_test_` prefix keys
- **Production**: Use `ak_live_` prefix keys
- **Separate Keys**: Never reuse dev keys in production

### Rate Limit Configuration
1. **Default Limit**: 1,000 requests/hour (conservative)
2. **Adjust Based on Usage**: Monitor and adjust limits
3. **Premium Tiers**: Higher limits for paid users
4. **Burst Protection**: Sliding window prevents bursts

## Testing

### Create API Key
```bash
# Authenticate first
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' | jq -r '.token')

# Create API key
curl -X POST http://localhost:8080/api/v1/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "description": "For testing",
    "rateLimit": 100
  }'
```

### Test API Key
```bash
# Use the API key from creation response
API_KEY="ak_test_a1b2c3d4e5f6789012345678901234567890abcd"

# Make authenticated request
curl -X GET http://localhost:8080/api/v1/assets \
  -H "X-API-Key: $API_KEY" \
  -v  # Verbose to see rate limit headers
```

### Test Rate Limiting
```bash
# Bash script to test rate limits
for i in {1..110}; do
  echo "Request $i"
  curl -X GET http://localhost:8080/api/v1/assets \
    -H "X-API-Key: $API_KEY" \
    -s -o /dev/null -w "%{http_code}\n"
  sleep 0.1
done
```

With a 100 req/hour limit, you'll see `200` responses turn to `429` after 100 requests.

## Frontend Integration

### API Key Management UI
Create a settings page for users to manage their API keys:

```jsx
// Example component structure
function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyData, setNewKeyData] = useState(null);

  const createKey = async (name, description, rateLimit) => {
    const response = await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, rateLimit })
    });
    
    const data = await response.json();
    
    // ⚠️ Show full API key ONCE - must be saved by user!
    setNewKeyData(data);
    
    // Refresh list
    loadApiKeys();
  };

  const revokeKey = async (id) => {
    await fetch(`/api/v1/api-keys/${id}/revoke`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadApiKeys();
  };

  return (
    // UI implementation
  );
}
```

### Key Features for UI
- **Copy to Clipboard**: One-click copy of API key
- **Warning Message**: "Save this key now - it won't be shown again"
- **Masked Display**: Show only prefix in list (e.g., `ak_test_a1b2c3d4...`)
- **Usage Stats**: Display last used timestamp
- **Status Indicators**: Active/Inactive badges
- **Expiry Warnings**: Highlight keys expiring soon

## Troubleshooting

### Invalid API Key Error
**Problem**: `401 Unauthorized - Invalid API key`

**Solutions**:
1. Check key format (should start with `ak_test_` or `ak_live_`)
2. Verify key is active (not revoked)
3. Check expiry date
4. Confirm header name is `X-API-Key` (case-sensitive)

### Rate Limit Exceeded
**Problem**: `429 Too Many Requests`

**Solutions**:
1. Wait for window reset (check `X-RateLimit-Reset` header)
2. Reduce request frequency
3. Request higher rate limit (update API key)
4. Implement client-side throttling

### Missing Rate Limit Headers
**Problem**: Headers not present in response

**Causes**:
1. No API key provided (using JWT auth instead)
2. Request to excluded endpoint (auth, health checks)
3. Error occurred before interceptor ran

## Performance Considerations

### Memory Usage
- Each API key tracks up to N requests (N = rate limit)
- Hourly cleanup removes old entries
- Estimate: ~100 bytes per request × limit × number of active keys

### Request Overhead
- **Validation**: ~1-5ms (bcrypt hash check)
- **Rate Check**: <1ms (in-memory lookup)
- **Total**: <10ms added latency

### Scaling
For high-traffic production:
1. **Redis Integration**: Use Redis for distributed rate limiting
2. **Database Indexing**: Indexes already created for performance
3. **Caching**: Cache API key lookups for 5-15 minutes
4. **Load Balancing**: Stateless design supports horizontal scaling

## Future Enhancements

- [ ] Scoped API Keys (restrict to specific endpoints)
- [ ] IP Whitelisting (restrict keys to specific IPs)
- [ ] Usage Analytics Dashboard
- [ ] Automatic Key Rotation
- [ ] Redis Integration for Distributed Rate Limiting
- [ ] Webhook for Rate Limit Events
- [ ] GraphQL Support
- [ ] OAuth 2.0 Integration
- [ ] API Key Templates (quick setup for common use cases)
- [ ] Burst Allowance (allow temporary spikes)

## Integration Count

With API Keys & Rate Limiting, Krubles now has **9 live integrations**:
1. REST API
2. API Keys & Rate Limiting ← NEW!
3. CSV Import/Export
4. Excel Import/Export
5. Webhooks
6. Slack Notifications
7. Email Notifications
8. Enhanced Filtered Exports
9. OpenAPI Documentation

**Next up**: Google OAuth for social sign-in 🚀
