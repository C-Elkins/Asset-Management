package com.chaseelkins.assetmanagement.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.chaseelkins.assetmanagement.security.JwtAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthFilter,
            @Value("${spring.profiles.active:dev}") String activeProfile) throws Exception {

        http
                .cors(Customizer.withDefaults())
                // CSRF enabled: Default protection active for all browser requests.
                // If strictly an API, consider using .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**")) 
                // instead of fully disabling, as documented by Spring for stateless APIs.
                // See: https://owasp.org/www-community/attacks/csrf
                // .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    // CRITICAL: Allow all OPTIONS requests (CORS preflight) FIRST
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                    // Public health endpoints (without /api/v1 prefix - it's the context path)
                    auth.requestMatchers("/actuator/health", "/healthz", "/health").permitAll();

                    // H2 Console - ONLY in dev profile, NEVER production or test
                    if ("dev".equals(activeProfile)) {
                        auth.requestMatchers("/h2-console/**").permitAll();
                    }

                    // Authentication endpoints (without /api/v1 prefix)
                    auth.requestMatchers("/auth/**").permitAll();

                    // Tenant registration - public endpoint for SaaS signup (without /api/v1
                    // prefix)
                    auth.requestMatchers("/tenants/register").permitAll();

                    // Swagger/OpenAPI - require authentication in all environments
                    if ("prod".equals(activeProfile)) {
                        // Completely disable in production for security
                        auth.requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**")
                                .denyAll();
                    } else {
                        // Require SUPER_ADMIN in non-production
                        auth.requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**")
                                .hasRole("SUPER_ADMIN");
                    }

                    // Admin-only actuator endpoints (without /api/v1 prefix)
                    auth.requestMatchers("/actuator/**").hasRole("SUPER_ADMIN");

                    // All other API endpoints require authentication
                    auth.requestMatchers("/assets/**", "/categories/**", "/maintenance/**",
                            "/users/**", "/dashboard/**", "/tenants/**", "/subscription/**", "/stripe/**")
                            .authenticated();

                    // Default deny all other requests
                    auth.anyRequest().authenticated();
                })
                .headers(headers -> {
                    // Frame options - strict in production, allow same-origin in dev for H2
                    if ("prod".equals(activeProfile)) {
                        headers.frameOptions(frame -> frame.deny());
                    } else {
                        headers.frameOptions(frame -> frame.sameOrigin());
                    }

                    // X-Content-Type-Options: nosniff
                    headers.contentTypeOptions(Customizer.withDefaults());

                    // X-XSS-Protection (deprecated but still useful for older browsers)
                    headers.xssProtection(Customizer.withDefaults());

                    // Strict-Transport-Security (HTTPS enforcement in production)
                    if ("prod".equals(activeProfile)) {
                        headers.httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true)
                                .maxAgeInSeconds(31536000) // 1 year
                        );
                    }

                    // Content-Security-Policy
                    headers.contentSecurityPolicy(csp -> csp.policyDirectives(
                            "default-src 'self'; " +
                                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // Required for React
                                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                    "font-src 'self' https://fonts.gstatic.com; " +
                                    "img-src 'self' data: https:; " +
                                    "connect-src 'self' https://api.openai.com; " +
                                    "frame-ancestors 'none'; " +
                                    "base-uri 'self'; " +
                                    "form-action 'self'"));

                    // Referrer-Policy
                    headers.referrerPolicy(policy -> policy
                            .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                });

        // Add filters in correct order:
        // 1. TenantFilter (extract tenant from subdomain/header)
        // 2. JwtAuthenticationFilter (authenticate user and extract tenant from JWT)
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:3005}") String allowedOrigins,
            @Value("${spring.profiles.active:dev}") String activeProfile) {

        CorsConfiguration config = new CorsConfiguration();

        // Parse allowed origins from comma-separated string
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        // In dev, be generous to avoid CORS friction across local ports
        if ("dev".equalsIgnoreCase(activeProfile)) {
            // Support any localhost/127.0.0.1 port
            config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        }

        // Allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Explicit headers - NO WILDCARDS for security
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "X-API-Key",
                "X-Correlation-ID"));

        // Headers exposed to client
        config.setExposedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-Total-Count",
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset"));

        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Register CORS for ALL paths (since context path is /api/v1)
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
