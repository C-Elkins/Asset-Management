package com.chaseelkins.assetmanagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Validates OAuth2 configuration on application startup.
 * Ensures that production environments don't use placeholder credentials.
 */
@Component
public class OAuth2ConfigValidator implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger log = LoggerFactory.getLogger(OAuth2ConfigValidator.class);

    // Forbidden placeholder values that indicate misconfiguration
    private static final List<String> FORBIDDEN_PLACEHOLDERS = Arrays.asList(
            "placeholder",
            "your-google-client-id-here",
            "your-google-client-secret-here",
            "placeholder-microsoft-client-id",
            "placeholder-microsoft-secret",
            "changeme",
            "example",
            "test",
            "dummy",
            "sample"
    );

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.microsoft.client-id:}")
    private String microsoftClientId;

    @Value("${spring.security.oauth2.client.registration.microsoft.client-secret:}")
    private String microsoftClientSecret;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("Validating OAuth2 configuration for profile: {}", activeProfile);

        // Only enforce strict validation in production
        boolean isProduction = "prod".equalsIgnoreCase(activeProfile);

        validateOAuth2Provider("Google", googleClientId, googleClientSecret, isProduction);
        validateOAuth2Provider("Microsoft", microsoftClientId, microsoftClientSecret, isProduction);

        log.info("OAuth2 configuration validation completed");
    }

    private void validateOAuth2Provider(String providerName, String clientId, String clientSecret, boolean isProduction) {
        boolean hasClientId = clientId != null && !clientId.trim().isEmpty();
        boolean hasClientSecret = clientSecret != null && !clientSecret.trim().isEmpty();

        // Check if provider is configured
        if (!hasClientId && !hasClientSecret) {
            log.warn("{} OAuth2 is not configured (no client ID or secret). " +
                    "This provider will be unavailable for login.", providerName);
            return;
        }

        // Check for incomplete configuration
        if (hasClientId != hasClientSecret) {
            String message = String.format("%s OAuth2 is partially configured. " +
                    "Both client ID and secret are required.", providerName);
            if (isProduction) {
                throw new IllegalStateException(message);
            } else {
                log.warn("{} Development/Test environment - continuing with partial configuration.", message);
            }
        }

        // Check for placeholder values
        if (hasClientId && containsPlaceholder(clientId)) {
            String message = String.format("%s OAuth2 client ID appears to be a placeholder: '%s'. " +
                    "Please configure a real client ID.", providerName, clientId);
            if (isProduction) {
                throw new IllegalStateException(message);
            } else {
                log.warn("{} Development/Test environment - continuing with placeholder.", message);
            }
        }

        if (hasClientSecret && containsPlaceholder(clientSecret)) {
            String message = String.format("%s OAuth2 client secret appears to be a placeholder. " +
                    "Please configure a real client secret.", providerName);
            if (isProduction) {
                throw new IllegalStateException(message);
            } else {
                log.warn("{} Development/Test environment - continuing with placeholder.", message);
            }
        }

        // Validate minimum lengths
        if (hasClientId && clientId != null && clientId.length() < 20) {
            String message = String.format("%s OAuth2 client ID is too short (%d chars). " +
                    "Real OAuth2 client IDs are typically 40+ characters.", providerName, clientId.length());
            if (isProduction) {
                throw new IllegalStateException(message);
            } else {
                log.warn("{} Development/Test environment - continuing with short client ID.", message);
            }
        }

        if (hasClientSecret && clientSecret != null && clientSecret.length() < 20) {
            String message = String.format("%s OAuth2 client secret is too short (%d chars). " +
                    "Real OAuth2 client secrets are typically 32+ characters.", providerName, clientSecret.length());
            if (isProduction) {
                throw new IllegalStateException(message);
            } else {
                log.warn("{} Development/Test environment - continuing with short client secret.", message);
            }
        }

        log.info("{} OAuth2 configuration validated successfully", providerName);
    }

    private boolean containsPlaceholder(String value) {
        if (value == null) {
            return false;
        }
        String lowerValue = value.toLowerCase();
        return FORBIDDEN_PLACEHOLDERS.stream()
                .anyMatch(lowerValue::contains);
    }
}
