package com.chaseelkins.assetmanagement.config;

import com.chaseelkins.assetmanagement.model.ApiKey;
import com.chaseelkins.assetmanagement.service.ApiKeyService;
import com.chaseelkins.assetmanagement.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.Optional;

/**
 * Interceptor to enforce rate limiting on API requests.
 * Checks for API key in X-API-Key header and applies rate limits.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private static final String API_KEY_HEADER = "X-API-Key";

    private final ApiKeyService apiKeyService;
    private final RateLimitService rateLimitService;

    public RateLimitInterceptor(ApiKeyService apiKeyService, RateLimitService rateLimitService) {
        this.apiKeyService = apiKeyService;
        this.rateLimitService = rateLimitService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip rate limiting for certain endpoints
        String path = request.getRequestURI();
        if (shouldSkipRateLimiting(path)) {
            return true;
        }

        // Check for API key header
        String apiKey = request.getHeader(API_KEY_HEADER);
        if (apiKey == null || apiKey.isEmpty()) {
            // No API key provided - allow request (will be authenticated via JWT)
            return true;
        }

        // Validate API key
        Optional<ApiKey> apiKeyOpt = apiKeyService.validateApiKey(apiKey);
        if (apiKeyOpt.isEmpty()) {
            logger.warn("Invalid API key attempted from IP: {}", request.getRemoteAddr());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Invalid API key\"}");
            return false;
        }

        ApiKey validApiKey = apiKeyOpt.get();
        String identifier = validApiKey.getPrefix();
        int limit = validApiKey.getRateLimit();

        // Check rate limit
        boolean allowed = rateLimitService.allowRequest(identifier, limit);
        
        // Add rate limit headers
        int remaining = rateLimitService.getRemainingRequests(identifier, limit);
        Instant resetTime = rateLimitService.getResetTime(identifier);
        
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetTime.getEpochSecond()));

        if (!allowed) {
            logger.warn("Rate limit exceeded for API key: {}", identifier);
            response.setStatus(429); // 429 Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write(String.format(
                    "{\"error\": \"Rate limit exceeded\", \"limit\": %d, \"reset\": %d}",
                    limit, resetTime.getEpochSecond()
            ));
            return false;
        }

        // Store API key in request attribute for controllers to use
        request.setAttribute("apiKey", validApiKey);
        request.setAttribute("userId", validApiKey.getUser().getId());

        return true;
    }

    private boolean shouldSkipRateLimiting(String path) {
        // Skip rate limiting for health checks, docs, and auth endpoints
        return path.startsWith("/actuator") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api-docs") ||
               path.startsWith("/h2-console") ||
               path.equals("/api/v1/auth/login") ||
               path.equals("/api/v1/auth/register");
    }
}
