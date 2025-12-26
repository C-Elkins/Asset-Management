package com.chaseelkins.assetmanagement.security;

import com.chaseelkins.assetmanagement.tenant.TenantContext;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final int MINIMUM_SECRET_LENGTH = 32; // 256 bits minimum for HS256

    private final SecretKey secretKey;
    private final long accessExpirationMillis;
    // legacy expiration kept only for backward compatibility logic in constructor

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration:-1}") long accessExpiration,
            @Value("${jwt.expiration:0}") long legacyExpiration) {
        
        // Priority 1: Use environment variable if set (most secure)
        String envSecret = System.getenv("JWT_SECRET");
        if (envSecret != null && !envSecret.isEmpty()) {
            secret = envSecret;
            logger.info("Using JWT secret from environment variable JWT_SECRET");
        } else {
            logger.warn("JWT secret loaded from configuration file. Consider using JWT_SECRET environment variable for better security.");
        }
        
        // Validate secret length
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT secret is not configured. Set jwt.secret in application.yml or JWT_SECRET environment variable."
            );
        }
        
        if (secret.length() < MINIMUM_SECRET_LENGTH) {
            throw new IllegalStateException(
                "JWT secret is too weak! Must be at least " + MINIMUM_SECRET_LENGTH + " characters (256 bits). " +
                "Current length: " + secret.length() + " characters. " +
                "Generate a strong secret with: openssl rand -base64 64"
            );
        }
        
        // Check for placeholder/default values
        if (secret.contains("changeme") || secret.contains("secret") || secret.contains("password")) {
            logger.error("JWT secret appears to be a placeholder value! This is EXTREMELY INSECURE.");
            throw new IllegalStateException(
                "JWT secret must not contain placeholder text like 'changeme', 'secret', or 'password'. " +
                "Generate a strong secret with: openssl rand -base64 64"
            );
        }
        
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMillis = accessExpiration > 0 ? accessExpiration : legacyExpiration; // prefer new property
        
        logger.info("JWT Token Provider initialized successfully with secret length: {} characters", secret.length());
    }

    public String generateToken(UserDetails userDetails) {
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiry = new Date(now + accessExpirationMillis);

        String roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        
        // Get tenant ID from context
        Long tenantId = TenantContext.getTenantId();
        
        var builder = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(issuedAt)
                .expiration(expiry)
                .claim("roles", roles);
        
        // Include tenant ID in token if present
        if (tenantId != null) {
            builder.claim("tenantId", tenantId);
            logger.debug("Generated JWT token with tenant_id: {} for user: {}", tenantId, userDetails.getUsername());
        } else {
            logger.warn("Generated JWT token without tenant_id for user: {}", userDetails.getUsername());
        }
        
        return builder.signWith(secretKey).compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
    
    public Long getTenantIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            Object tenantIdClaim = claims.get("tenantId");
            if (tenantIdClaim != null) {
                if (tenantIdClaim instanceof Integer) {
                    return ((Integer) tenantIdClaim).longValue();
                } else if (tenantIdClaim instanceof Long) {
                    return (Long) tenantIdClaim;
                }
            }
            return null;
        } catch (Exception e) {
            logger.error("Error extracting tenant ID from token", e);
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public long getAccessExpirationMillis() {
        return accessExpirationMillis;
    }
}
