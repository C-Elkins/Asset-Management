package com.chaseelkins.assetmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for rate limiting API requests.
 * Uses in-memory sliding window algorithm.
 * For production with multiple servers, use Redis.
 */
@Service
public class RateLimitService {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitService.class);

    // In-memory storage: key -> request timestamps
    private final Map<String, RequestWindow> requestWindows = new ConcurrentHashMap<>();

    // Window duration (1 hour)
    private static final Duration WINDOW_DURATION = Duration.ofHours(1);

    /**
     * Check if request should be allowed based on rate limit
     * @param identifier Unique identifier (API key prefix or user ID)
     * @param limit Maximum requests allowed per hour
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean allowRequest(String identifier, int limit) {
        RequestWindow window = requestWindows.computeIfAbsent(
                identifier, 
                k -> new RequestWindow()
        );

        return window.allowRequest(limit);
    }

    /**
     * Get remaining requests for identifier
     */
    public int getRemainingRequests(String identifier, int limit) {
        RequestWindow window = requestWindows.get(identifier);
        if (window == null) {
            return limit;
        }
        return Math.max(0, limit - window.getRequestCount());
    }

    /**
     * Get reset time for identifier (when window resets)
     */
    public Instant getResetTime(String identifier) {
        RequestWindow window = requestWindows.get(identifier);
        if (window == null) {
            return Instant.now().plus(WINDOW_DURATION);
        }
        return window.getOldestRequestTime().plus(WINDOW_DURATION);
    }

    /**
     * Clear rate limit for identifier (useful for testing)
     */
    public void clearRateLimit(String identifier) {
        requestWindows.remove(identifier);
        logger.info("Cleared rate limit for identifier: {}", identifier);
    }

    /**
     * Clean up old entries periodically
     */
    public void cleanup() {
        int sizeBefore = requestWindows.size();
        requestWindows.entrySet().removeIf(entry -> 
                entry.getValue().isExpired()
        );
        int sizeAfter = requestWindows.size();
        if (sizeBefore != sizeAfter) {
            logger.info("Cleaned up {} expired rate limit entries", sizeBefore - sizeAfter);
        }
    }

    /**
     * Sliding window for tracking requests
     */
    private static class RequestWindow {
        private final ConcurrentHashMap<Long, Instant> requests = new ConcurrentHashMap<>();
        private long requestIdCounter = 0;

        public synchronized boolean allowRequest(int limit) {
            // Remove requests outside the window
            Instant windowStart = Instant.now().minus(WINDOW_DURATION);
            requests.entrySet().removeIf(entry -> 
                    entry.getValue().isBefore(windowStart)
            );

            // Check if limit exceeded
            if (requests.size() >= limit) {
                return false;
            }

            // Add new request
            requests.put(requestIdCounter++, Instant.now());
            return true;
        }

        public int getRequestCount() {
            // Remove old requests first
            Instant windowStart = Instant.now().minus(WINDOW_DURATION);
            requests.entrySet().removeIf(entry -> 
                    entry.getValue().isBefore(windowStart)
            );
            return requests.size();
        }

        public Instant getOldestRequestTime() {
            return requests.values().stream()
                    .min(Instant::compareTo)
                    .orElse(Instant.now());
        }

        public boolean isExpired() {
            if (requests.isEmpty()) {
                return true;
            }
            Instant windowStart = Instant.now().minus(WINDOW_DURATION);
            return requests.values().stream()
                    .allMatch(time -> time.isBefore(windowStart));
        }
    }
}
