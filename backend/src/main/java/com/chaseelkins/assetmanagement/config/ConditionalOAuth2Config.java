package com.chaseelkins.assetmanagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

import java.util.ArrayList;
import java.util.List;

/**
 * Conditional OAuth2 Configuration
 * Only registers OAuth2 clients when credentials are actually provided.
 * This allows the application to run without OAuth2 for local development.
 */
@Configuration
public class ConditionalOAuth2Config {

    private static final Logger log = LoggerFactory.getLogger(ConditionalOAuth2Config.class);

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    @Value("${GOOGLE_CLIENT_SECRET:}")
    private String googleClientSecret;

    @Value("${MICROSOFT_CLIENT_ID:}")
    private String microsoftClientId;

    @Value("${MICROSOFT_CLIENT_SECRET:}")
    private String microsoftClientSecret;

    @Value("${MICROSOFT_TENANT_ID:common}")
    private String microsoftTenantId;

    /**
     * Only create the ClientRegistrationRepository bean if at least one OAuth2 provider is configured.
     * This prevents Spring Security from trying to wire up OAuth2 support when no providers are available.
     */
    @Bean
    @ConditionalOnExpression("!'${GOOGLE_CLIENT_ID:}'.isEmpty() || !'${MICROSOFT_CLIENT_ID:}'.isEmpty()")
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = new ArrayList<>();
        
        // Add Google if configured
        if (isConfigured(googleClientId, googleClientSecret)) {
            log.info("Google OAuth2 configured - adding registration");
            registrations.add(googleClientRegistration());
        } else {
            log.info("Google OAuth2 not configured - skipping registration");
        }
        
        // Add Microsoft if configured
        if (isConfigured(microsoftClientId, microsoftClientSecret)) {
            log.info("Microsoft OAuth2 configured - adding registration");
            registrations.add(microsoftClientRegistration());
        } else {
            log.info("Microsoft OAuth2 not configured - skipping registration");
        }
        
        return new InMemoryClientRegistrationRepository(registrations);
    }

    private boolean isConfigured(String clientId, String clientSecret) {
        return clientId != null && !clientId.trim().isEmpty() 
            && clientSecret != null && !clientSecret.trim().isEmpty();
    }

    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
                .clientId(googleClientId)
                .clientSecret(googleClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/api/v1/auth/oauth2/callback/google")
                .scope("email", "profile")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .build();
    }

    private ClientRegistration microsoftClientRegistration() {
        String authorizationUri = String.format(
                "https://login.microsoftonline.com/%s/oauth2/v2.0/authorize", 
                microsoftTenantId
        );
        String tokenUri = String.format(
                "https://login.microsoftonline.com/%s/oauth2/v2.0/token", 
                microsoftTenantId
        );

        return ClientRegistration.withRegistrationId("microsoft")
                .clientId(microsoftClientId)
                .clientSecret(microsoftClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/api/v1/auth/oauth2/callback/microsoft")
                .scope("openid", "profile", "email", "User.Read")
                .authorizationUri(authorizationUri)
                .tokenUri(tokenUri)
                .userInfoUri("https://graph.microsoft.com/v1.0/me")
                .userNameAttributeName("id")
                .clientName("Microsoft")
                .build();
    }
}
