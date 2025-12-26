package com.chaseelkins.assetmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Validates that required secrets are properly configured on application startup.
 * Fails fast if critical environment variables are missing or insecure.
 * 
 * This prevents deployment with default/placeholder secrets.
 */
@Component
public class SecretsValidator implements ApplicationListener<ApplicationReadyEvent> {
    
    private static final Logger logger = LoggerFactory.getLogger(SecretsValidator.class);
    private static final int MINIMUM_SECRET_LENGTH = 32;
    
    @Value("${jwt.secret:}")
    private String jwtSecret;
    
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        logger.info("🔍 Validating security configuration...");
        
        boolean isProduction = "prod".equals(activeProfile);
        
        // Validate JWT secret
        validateJwtSecret(isProduction);
        
        // Warn about production mode
        if (isProduction) {
            logger.warn("🔒 PRODUCTION MODE ACTIVE - Ensure all secrets are from secure vault!");
            logger.warn("🔒 Expected environment variables:");
            logger.warn("   - JWT_SECRET (required)");
            logger.warn("   - STRIPE_SECRET_KEY (if payments enabled)");
            logger.warn("   - STRIPE_PUBLISHABLE_KEY (if payments enabled)");
            logger.warn("   - GOOGLE_CLIENT_SECRET (if OAuth enabled)");
            logger.warn("   - MICROSOFT_CLIENT_SECRET (if OAuth enabled)");
        }
        
        logger.info("✅ Security configuration validated successfully");
    }
    
    private void validateJwtSecret(boolean isProduction) {
        // Check if JWT secret is set
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            logger.error("❌ FATAL: JWT_SECRET environment variable is not set!");
            logger.error("❌ This is a critical security requirement.");
            logger.error("❌ Generate a secure secret with: openssl rand -base64 64");
            logger.error("❌ Then set: export JWT_SECRET=<generated-secret>");
            throw new IllegalStateException(
                "JWT_SECRET environment variable is required. " +
                "Generate with: openssl rand -base64 64"
            );
        }
        
        // Check minimum length
        if (jwtSecret.length() < MINIMUM_SECRET_LENGTH) {
            logger.error("❌ FATAL: JWT_SECRET is too short!");
            logger.error("❌ Minimum length: {} characters", MINIMUM_SECRET_LENGTH);
            logger.error("❌ Current length: {} characters", jwtSecret.length());
            logger.error("❌ Generate a stronger secret with: openssl rand -base64 64");
            throw new IllegalStateException(
                String.format(
                    "JWT_SECRET is too short! Minimum %d characters required, got %d. " +
                    "Generate with: openssl rand -base64 64",
                    MINIMUM_SECRET_LENGTH,
                    jwtSecret.length()
                )
            );
        }
        
        // Check for placeholder/insecure values
        String lowerSecret = jwtSecret.toLowerCase();
        if (lowerSecret.contains("changeme") || 
            lowerSecret.contains("secret") || 
            lowerSecret.contains("password") || 
            lowerSecret.contains("mysecretkey") ||
            lowerSecret.contains("placeholder") ||
            lowerSecret.contains("example") ||
            lowerSecret.contains("default")) {
            
            logger.error("❌ FATAL: JWT_SECRET appears to be a placeholder value!");
            logger.error("❌ Detected insecure text pattern in secret.");
            logger.error("❌ NEVER use default/example secrets in any environment.");
            logger.error("❌ Generate a cryptographically secure secret with: openssl rand -base64 64");
            throw new IllegalStateException(
                "JWT_SECRET contains placeholder/insecure text. " +
                "Generate a strong random secret with: openssl rand -base64 64"
            );
        }
        
        // Additional production checks
        if (isProduction) {
            // In production, require even longer secrets
            if (jwtSecret.length() < 64) {
                logger.warn("⚠️  WARNING: JWT_SECRET is shorter than recommended for production");
                logger.warn("⚠️  Current length: {} characters", jwtSecret.length());
                logger.warn("⚠️  Recommended: 64+ characters for production");
                logger.warn("⚠️  Generate with: openssl rand -base64 64");
            }
        }
        
        logger.info("✅ JWT secret validated: length={} characters", jwtSecret.length());
    }
}
