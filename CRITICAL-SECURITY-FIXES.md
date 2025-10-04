# 🚨 CRITICAL SECURITY FIXES - DO IMMEDIATELY

## ⚡ Quick Start (30 Minutes)

### Step 1: Remove Hardcoded Secrets (10 min)

**File: `backend/src/main/resources/application.yml`**

Replace lines 130-136:
```yaml
# BEFORE (INSECURE):
jwt:
  secret: "${JWT_SECRET:mySecretKey123456789012345678901234567890}"
  
# AFTER (SECURE):
jwt:
  secret: "${JWT_SECRET}"  # No fallback - will fail if not set
```

Replace lines 80-82:
```yaml
# BEFORE (INSECURE):
stripe:
  api-key: ${STRIPE_SECRET_KEY:sk_test_51SE1M7RnSgrmRk1T...}
  publishable-key: ${STRIPE_PUBLISHABLE_KEY:pk_test_51SE1M7...}

# AFTER (SECURE):
stripe:
  api-key: ${STRIPE_SECRET_KEY}
  publishable-key: ${STRIPE_PUBLISHABLE_KEY}
```

Replace lines 42-44:
```yaml
# BEFORE (INSECURE):
google:
  client-secret: "${GOOGLE_CLIENT_SECRET:your-google-client-secret-here}"

# AFTER (SECURE):
google:
  client-secret: "${GOOGLE_CLIENT_SECRET}"
```

### Step 2: Generate New Secrets (5 min)

```bash
# Generate JWT secret (256-bit minimum)
openssl rand -base64 64

# Save output, then set environment variable
export JWT_SECRET="<paste-generated-secret-here>"
```

**For production:**
- AWS: Store in AWS Secrets Manager or Parameter Store
- Kubernetes: Store as Secret
- Docker: Pass via `--env-file` or Kubernetes secret mount

### Step 3: Add Startup Validation (10 min)

Create new file: `backend/src/main/java/com/chaseelkins/assetmanagement/config/SecretsValidator.java`

```java
package com.chaseelkins.assetmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class SecretsValidator implements ApplicationListener<ApplicationReadyEvent> {
    
    private static final Logger logger = LoggerFactory.getLogger(SecretsValidator.class);
    
    @Value("${jwt.secret:}")
    private String jwtSecret;
    
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Validate JWT secret
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            logger.error("❌ FATAL: JWT_SECRET environment variable is required!");
            logger.error("Generate with: openssl rand -base64 64");
            System.exit(1);
        }
        
        if (jwtSecret.length() < 32) {
            logger.error("❌ FATAL: JWT_SECRET is too short! Minimum 32 characters required.");
            logger.error("Current length: {} characters", jwtSecret.length());
            System.exit(1);
        }
        
        // Check for placeholder values
        if (jwtSecret.contains("changeme") || jwtSecret.contains("secret") || 
            jwtSecret.contains("password") || jwtSecret.contains("mySecretKey")) {
            logger.error("❌ FATAL: JWT_SECRET contains placeholder text!");
            logger.error("Generate a strong secret with: openssl rand -base64 64");
            System.exit(1);
        }
        
        logger.info("✅ JWT secret validated successfully");
        
        // Warn about production secrets
        if ("prod".equals(activeProfile)) {
            logger.warn("🔒 Production mode - ensure all secrets are from secure vault");
        }
    }
}
```

### Step 4: Add Auth Rate Limiting (10 min)

Create new file: `backend/src/main/java/com/chaseelkins/assetmanagement/security/AuthRateLimiter.java`

```java
package com.chaseelkins.assetmanagement.security;

import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimiter {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthRateLimiter.class);
    
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);
    
    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();
    
    public boolean allowLoginAttempt(String email, String ipAddress) {
        String identifier = email.toLowerCase() + ":" + ipAddress;
        
        RateLimitBucket bucket = buckets.computeIfAbsent(
            identifier,
            k -> new RateLimitBucket(MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION)
        );
        
        if (!bucket.tryConsume()) {
            logger.warn("🚫 Rate limit exceeded for login attempt: email={}, ip={}", 
                       email, ipAddress);
            return false;
        }
        
        return true;
    }
    
    public void recordFailedLogin(String email, String ipAddress) {
        String identifier = email.toLowerCase() + ":" + ipAddress;
        
        RateLimitBucket bucket = buckets.get(identifier);
        if (bucket != null) {
            int remaining = bucket.getRemaining();
            logger.warn("⚠️ Failed login attempt: email={}, ip={}, attempts_remaining={}", 
                       email, ipAddress, remaining);
            
            if (remaining == 0) {
                logger.error("🔒 Account locked due to too many failed attempts: email={}, ip={}", 
                           email, ipAddress);
            }
        }
    }
    
    public void clearLimits(String email, String ipAddress) {
        String identifier = email.toLowerCase() + ":" + ipAddress;
        buckets.remove(identifier);
        logger.info("✅ Cleared rate limits for: email={}, ip={}", email, ipAddress);
    }
    
    private static class RateLimitBucket {
        private final int maxAttempts;
        private final Duration lockoutDuration;
        private int remainingAttempts;
        private Instant lockoutUntil;
        
        public RateLimitBucket(int maxAttempts, Duration lockoutDuration) {
            this.maxAttempts = maxAttempts;
            this.lockoutDuration = lockoutDuration;
            this.remainingAttempts = maxAttempts;
            this.lockoutUntil = null;
        }
        
        public synchronized boolean tryConsume() {
            Instant now = Instant.now();
            
            // Check if locked out
            if (lockoutUntil != null && now.isBefore(lockoutUntil)) {
                return false;
            }
            
            // Reset if lockout expired
            if (lockoutUntil != null && now.isAfter(lockoutUntil)) {
                remainingAttempts = maxAttempts;
                lockoutUntil = null;
            }
            
            // Consume attempt
            if (remainingAttempts > 0) {
                remainingAttempts--;
                
                // Lock out if no attempts remaining
                if (remainingAttempts == 0) {
                    lockoutUntil = now.plus(lockoutDuration);
                }
                
                return true;
            }
            
            return false;
        }
        
        public int getRemaining() {
            return remainingAttempts;
        }
    }
}
```

Update `AuthController.java`:

```java
// Add field
private final AuthRateLimiter authRateLimiter;

// Update constructor
public AuthController(AuthenticationManager authenticationManager,
                      JwtTokenProvider jwtTokenProvider,
                      RefreshTokenService refreshTokenService,
                      UserRepository userRepository,
                      UserService userService,
                      MeterRegistry registry,
                      AuthRateLimiter authRateLimiter) {  // Add this
    // ... existing code
    this.authRateLimiter = authRateLimiter;
}

// Update login method
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody AuthRequest request, 
                               HttpServletRequest httpRequest) {
    String ipAddress = httpRequest.getRemoteAddr();
    
    // Check rate limit FIRST
    if (!authRateLimiter.allowLoginAttempt(request.getEmail(), ipAddress)) {
        loginFailure.increment();
        return ResponseEntity.status(429)
            .body(new ErrorResponse(
                "Too many login attempts. Please try again in 15 minutes."
            ));
    }
    
    try {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), 
                request.getPassword()
            )
        );
        
        // ... existing success code
        
        // Clear rate limits on successful login
        authRateLimiter.clearLimits(request.getEmail(), ipAddress);
        
        loginSuccess.increment();
        return builder.body(payload);
        
    } catch (BadCredentialsException ex) {
        // Record failed attempt
        authRateLimiter.recordFailedLogin(request.getEmail(), ipAddress);
        loginFailure.increment();
        
        return ResponseEntity.status(401)
            .body(new ErrorResponse(
                "Invalid username or password. Please check your credentials and try again."
            ));
    } catch (AuthenticationException ex) {
        authRateLimiter.recordFailedLogin(request.getEmail(), ipAddress);
        loginFailure.increment();
        
        return ResponseEntity.status(401)
            .body(new ErrorResponse(
                "Authentication failed. Please verify your account status and try again."
            ));
    }
}
```

---

## ✅ Testing Your Fixes

### Test 1: JWT Secret Validation
```bash
# Should FAIL to start
cd backend
unset JWT_SECRET
./mvnw spring-boot:run

# Should see error:
# ❌ FATAL: JWT_SECRET environment variable is required!

# Should START successfully
export JWT_SECRET=$(openssl rand -base64 64)
./mvnw spring-boot:run

# Should see:
# ✅ JWT secret validated successfully
```

### Test 2: Rate Limiting
```bash
# Try to login 6 times with wrong password
for i in {1..6}; do
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done

# 6th attempt should return 429 Too Many Requests
```

---

## 📋 Deployment Checklist

### Development Environment
- [x] Generate JWT secret: `openssl rand -base64 64`
- [x] Add to `.env` file (don't commit!)
- [x] Load env vars: `source .env`
- [x] Test application starts successfully
- [x] Test login works
- [x] Test rate limiting works

### Production Environment

#### Option 1: AWS (Recommended)
```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name prod/asset-management/jwt-secret \
  --secret-string "$(openssl rand -base64 64)"

# Retrieve in application
export JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id prod/asset-management/jwt-secret \
  --query SecretString \
  --output text)
```

#### Option 2: Kubernetes
```yaml
# Create secret
apiVersion: v1
kind: Secret
metadata:
  name: asset-management-secrets
type: Opaque
stringData:
  jwt-secret: "<generated-secret>"
  stripe-api-key: "<stripe-key>"
---
# Use in deployment
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: backend
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: asset-management-secrets
              key: jwt-secret
```

#### Option 3: Docker Compose
```yaml
# docker-compose.prod.yml
services:
  backend:
    image: asset-management-backend:latest
    env_file:
      - .env.production  # Never commit this file!
```

---

## 🔍 Verification Commands

```bash
# 1. Check for hardcoded secrets in code
cd backend
grep -r "mySecretKey" src/
grep -r "sk_test_" src/
grep -r "pk_test_" src/

# Should return NO results

# 2. Verify secrets are environment-only
grep "JWT_SECRET" src/main/resources/application*.yml

# Should show: jwt.secret: "${JWT_SECRET}"  (no fallback)

# 3. Test rate limiting
./test-rate-limit.sh

# 4. Check logs for security warnings
tail -f logs/application.json | grep -i "security\|auth\|login"
```

---

## 📞 Need Help?

### Common Issues

**Q: Application won't start after removing fallback secrets**  
A: This is EXPECTED! Set the environment variables:
```bash
export JWT_SECRET=$(openssl rand -base64 64)
export STRIPE_SECRET_KEY=sk_live_...
export STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Q: How do I rotate secrets in production?**  
A: Use blue-green deployment:
1. Update secret in vault/secrets manager
2. Deploy new version with updated secret
3. Gracefully shutdown old version
4. Monitor for authentication failures

**Q: What if JWT_SECRET leaks?**  
A: 
1. Generate new secret immediately
2. Deploy with new secret
3. All existing tokens become invalid (users must re-login)
4. Review access logs for suspicious activity

---

## 📚 Next Steps

After implementing these CRITICAL fixes, review the full report:
- [SECURITY-AUDIT-REPORT.md](./SECURITY-AUDIT-REPORT.md)

Then implement:
1. **HIGH priority** fixes (this week)
2. **MEDIUM priority** fixes (this month)
3. Schedule quarterly security reviews
