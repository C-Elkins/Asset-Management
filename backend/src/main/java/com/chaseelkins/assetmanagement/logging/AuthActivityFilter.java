package com.chaseelkins.assetmanagement.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Captures auth-related endpoint outcomes with a correlation ID.
 * Adds correlationId to MDC (if not already present via tracing) for structured logging.
 */
@Component
@Order(10)
public class AuthActivityFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(AuthActivityFilter.class);

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean authPath = path.contains("/auth/");
        String correlationId = request.getHeader("X-Correlation-Id");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }
        org.slf4j.MDC.put("correlationId", correlationId);
        long start = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            if (authPath) {
                long durationMs = (System.nanoTime() - start) / 1_000_000L;
                log.info("auth_activity path={} method={} status={} durationMs={}", path, request.getMethod(), response.getStatus(), durationMs);
            }
            org.slf4j.MDC.remove("correlationId");
        }
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        // Apply to auth endpoints only
        return !request.getRequestURI().contains("/auth/");
    }
}
