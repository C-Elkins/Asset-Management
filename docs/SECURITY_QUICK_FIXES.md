# Security Quick Fixes - Priority Actions

## 🔴 CRITICAL - Fix Immediately (Today)

### 1. JWT Secret Hardening (30 minutes)

**Generate strong secret:**
```bash
openssl rand -base64 64
```

**Update SecurityConfig.java:**
```java
public JwtTokenProvider(@Value("${jwt.secret}") String secret) {
    // Load from environment variable FIRST
    String envSecret = System.getenv("JWT_SECRET");
    if (envSecret != null && !envSecret.isEmpty()) {
        secret = envSecret;
    }
    
    // Validate minimum length (256 bits = 32 characters)
    if (secret.length() < 32) {
        throw new IllegalStateException(
            "JWT secret must be at least 32 characters (256 bits). " +
            "Generate with: openssl rand -base64 64"
        );
    }
    
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
}
```

**Set environment variable:**
```bash
export JWT_SECRET="your-512-bit-secret-here"
```

---

### 2. Disable H2 Console in Production (5 minutes)

**application-prod.yml:**
```yaml
spring:
  h2:
    console:
      enabled: false  # ❌ NEVER enable in production
```

**SecurityConfig.java:**
```java
@Bean
public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtAuthenticationFilter jwtAuthFilter,
        @Value("${spring.profiles.active}") String activeProfile) throws Exception {
    
    http
        .authorizeHttpRequests(auth -> {
            // H2 Console ONLY in dev
            if ("dev".equals(activeProfile)) {
                auth.requestMatchers("/h2-console/**").permitAll();
            }
            // ... rest of config
        })
        .headers(headers -> {
            if ("prod".equals(activeProfile)) {
                headers.frameOptions(frame -> frame.deny());
            } else {
                headers.frameOptions(frame -> frame.sameOrigin());
            }
        });
    
    return http.build();
}
```

---

### 3. Fix CORS Configuration (10 minutes)

**SecurityConfig.java:**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource(
        @Value("${app.cors.allowed-origins}") String allowedOrigins) {
    
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    
    // ✅ Explicit headers - NO WILDCARDS
    config.setAllowedHeaders(List.of(
        "Authorization",
        "Content-Type",
        "Accept",
        "X-Requested-With",
        "X-API-Key"
    ));
    
    config.setExposedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

**application-dev.yml:**
```yaml
app:
  cors:
    allowed-origins: http://localhost:3005,http://127.0.0.1:3005
```

**application-prod.yml:**
```yaml
app:
  cors:
    allowed-origins: https://app.krubles.com,https://www.krubles.com
```

---

### 4. Remove Anonymous Asset Access (5 minutes)

**SecurityConfig.java - REMOVE these lines:**
```java
// ❌ DELETE THIS:
.requestMatchers("/", "/categories", "/categories/active", 
                 "/categories/recent", "/assets", "/dashboard/stats").permitAll()
```

**Replace with:**
```java
// ✅ ADD THIS:
.requestMatchers("/actuator/health", "/api/v1/healthz").permitAll()
.requestMatchers("/auth/**", "/swagger-ui/**", "/api-docs/**").permitAll()
.requestMatchers("/actuator/**").hasRole("SUPER_ADMIN")
.requestMatchers("/api/v1/**").authenticated()
.anyRequest().authenticated()
```

---

## 🟡 HIGH PRIORITY - Fix This Week

### 5. Add Security Headers (15 minutes)

**SecurityConfig.java:**
```java
.headers(headers -> {
    headers
        .contentTypeOptions(opts -> {})  // X-Content-Type-Options: nosniff
        .xssProtection(xss -> xss.headerValue("1; mode=block"))
        .frameOptions(frame -> frame.deny())
        .httpStrictTransportSecurity(hsts -> 
            hsts.includeSubDomains(true).maxAgeInSeconds(31536000)
        )
        .contentSecurityPolicy(csp -> csp.policyDirectives(
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none'"
        ))
        .referrerPolicy(policy -> 
            policy.policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
        );
})
```

---

### 6. Enhance Rate Limiting (30 minutes)

**RateLimitInterceptor.java:**
```java
@Override
public boolean preHandle(HttpServletRequest request, 
                        HttpServletResponse response, 
                        Object handler) throws Exception {
    
    String identifier = getClientIdentifier(request);
    String endpoint = request.getRequestURI();
    RateLimitConfig config = getRateLimitConfig(endpoint);
    
    if (!rateLimitService.allowRequest(identifier, config)) {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("X-RateLimit-Limit", String.valueOf(config.getLimit()));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", 
            String.valueOf(System.currentTimeMillis() + (config.getWindowSeconds() * 1000)));
        response.setHeader("Retry-After", String.valueOf(config.getWindowSeconds()));
        
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"error\":\"Rate limit exceeded\",\"retryAfter\":" + 
            config.getWindowSeconds() + "}"
        );
        return false;
    }
    
    return true;
}

private String getClientIdentifier(HttpServletRequest request) {
    // Priority: API Key > JWT > IP
    String apiKey = request.getHeader("X-API-Key");
    if (apiKey != null) return "apikey:" + apiKey;
    
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
        return "user:" + auth.getName();
    }
    
    return "ip:" + getClientIP(request);
}

private RateLimitConfig getRateLimitConfig(String endpoint) {
    if (endpoint.startsWith("/auth/")) return new RateLimitConfig(5, 60);
    if (endpoint.startsWith("/api/v1/ai/")) return new RateLimitConfig(10, 60);
    if (endpoint.contains("/export")) return new RateLimitConfig(3, 60);
    return new RateLimitConfig(100, 60);
}
```

---

### 7. Add Request Size Limits (2 minutes)

**application.yml:**
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  max-http-header-size: 8KB
  tomcat:
    max-swallow-size: 2MB
    max-http-post-size: 10MB
```

---

### 8. Add OAuth2 Secret Validation (10 minutes)

**OAuth2ConfigValidator.java (new file):**
```java
package com.chaseelkins.assetmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import javax.annotation.PostConstruct;

@Configuration
@Profile("prod")
public class OAuth2ConfigValidator {
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${spring.security.oauth2.client.registration.microsoft.client-secret}")
    private String microsoftClientSecret;
    
    @PostConstruct
    public void validateSecrets() {
        validateSecret(googleClientSecret, "GOOGLE_CLIENT_SECRET");
        validateSecret(microsoftClientSecret, "MICROSOFT_CLIENT_SECRET");
    }
    
    private void validateSecret(String secret, String name) {
        if (secret == null || 
            secret.contains("placeholder") ||
            secret.contains("your-") ||
            secret.length() < 20) {
            throw new IllegalStateException(
                "Production OAuth2 secret not configured: " + name + ". " +
                "Set environment variable."
            );
        }
    }
}
```

---

## 🔵 MEDIUM PRIORITY - Fix Next Week

### 9. Add Audit Logging (1 hour)

**SecurityAuditAspect.java (new file):**
```java
package com.chaseelkins.assetmanagement.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class SecurityAuditAspect {
    
    private static final Logger auditLogger = LoggerFactory.getLogger("SECURITY_AUDIT");
    
    @Around("execution(* com.chaseelkins.assetmanagement.controller.AuthController.*(..))")
    public Object logAuthenticationAttempts(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().getName();
        String username = extractUsername(joinPoint.getArgs());
        
        try {
            Object result = joinPoint.proceed();
            auditLogger.info("AUTH_SUCCESS: method={}, user={}", method, username);
            return result;
        } catch (Exception ex) {
            auditLogger.warn("AUTH_FAILURE: method={}, user={}, error={}", 
                method, username, ex.getMessage());
            throw ex;
        }
    }
    
    @AfterThrowing(
        pointcut = "execution(* com.chaseelkins.assetmanagement.controller..*(..))",
        throwing = "ex"
    )
    public void logAccessDenied(JoinPoint joinPoint, Exception ex) {
        if (ex instanceof org.springframework.security.access.AccessDeniedException) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            auditLogger.warn("ACCESS_DENIED: user={}, endpoint={}, error={}", 
                auth != null ? auth.getName() : "anonymous",
                joinPoint.getSignature().toShortString(),
                ex.getMessage()
            );
        }
    }
    
    private String extractUsername(Object[] args) {
        // Extract username from login request
        if (args.length > 0 && args[0] != null) {
            return args[0].toString();
        }
        return "unknown";
    }
}
```

**logback-spring.xml (add this appender):**
```xml
<appender name="SECURITY_AUDIT" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/security-audit.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>logs/security-audit-%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>90</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>

<logger name="SECURITY_AUDIT" level="INFO" additivity="false">
    <appender-ref ref="SECURITY_AUDIT" />
</logger>
```

---

### 10. Add Input Validation on Path Variables (30 minutes)

**Add to controllers:**
```java
@RestController
@RequestMapping("/api/v1/assets")
@Validated  // ✅ Enable method-level validation
public class AssetController {
    
    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAsset(
            @PathVariable 
            @Min(value = 1, message = "Asset ID must be positive")
            @Max(value = Long.MAX_VALUE, message = "Invalid asset ID")
            Long id) {
        return assetService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<Asset>> searchAssets(
            @RequestParam
            @Pattern(regexp = "^[a-zA-Z0-9-_ ]{0,100}$", 
                     message = "Invalid search term")
            Optional<String> search,
            
            @RequestParam
            @Min(value = 0, message = "Page must be non-negative")
            @Max(value = 1000, message = "Page too large")
            Optional<Integer> page) {
        
        return ResponseEntity.ok(
            assetService.search(search.orElse(""), page.orElse(0))
        );
    }
}
```

**Add exception handler:**
```java
@RestControllerAdvice
public class ValidationExceptionHandler {
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolation(
            ConstraintViolationException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            errors.put(violation.getPropertyPath().toString(), violation.getMessage());
        });
        
        return ResponseEntity.badRequest().body(errors);
    }
}
```

---

## Testing Security Fixes

### 1. Test JWT Secret Validation
```bash
# Should fail with weak secret
JWT_SECRET="short" ./mvnw spring-boot:run

# Should work with strong secret
JWT_SECRET="$(openssl rand -base64 64)" ./mvnw spring-boot:run
```

### 2. Test H2 Console Disabled
```bash
# Should return 404 in production
curl -I http://localhost:8080/h2-console
```

### 3. Test CORS
```bash
# Should be rejected (evil origin)
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8080/api/v1/assets

# Should be allowed (your origin)
curl -H "Origin: https://app.krubles.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8080/api/v1/assets
```

### 4. Test Anonymous Access Blocked
```bash
# Should return 401 Unauthorized
curl -I http://localhost:8080/api/v1/assets
```

### 5. Test Rate Limiting
```bash
# Hammer auth endpoint 10 times
for i in {1..10}; do
  curl -X POST http://localhost:8080/auth/login \
       -H "Content-Type: application/json" \
       -d '{"username":"test","password":"test"}'
done
# Should get 429 Too Many Requests after 5 attempts
```

---

## Security Checklist Progress

Track your progress:

### Critical (This Week)
- [ ] JWT secret hardening
- [ ] H2 console disabled in production
- [ ] CORS configuration fixed
- [ ] Anonymous asset access removed
- [ ] OAuth2 secrets validated

### High Priority (Next Week)
- [ ] Security headers added
- [ ] Rate limiting enhanced
- [ ] Request size limits added
- [ ] Audit logging implemented

### Medium Priority (Week 3-4)
- [ ] Path variable validation added
- [ ] Token refresh implemented
- [ ] API key rotation added
- [ ] Data encryption enabled

---

## Quick Reference Commands

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate password
openssl rand -base64 32

# Test endpoint authentication
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/assets

# Check security headers
curl -I http://localhost:8080/api/v1/healthz

# Run security audit
./mvnw dependency-check:check

# Update all dependencies
./mvnw versions:use-latest-releases
```

---

**Last Updated:** October 3, 2025  
**Priority:** CRITICAL - Implement fixes immediately
