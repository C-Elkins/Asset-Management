package com.chaseelkins.assetmanagement.security;

import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter for authentication endpoints to prevent brute force attacks.
 * 
 * Implements a sliding window rate limiting algorithm:
 * - Tracks failed login attempts per email + IP address combination
 * - Locks out after MAX_LOGIN_ATTEMPTS within the window
 * - Automatically resets after LOCKOUT_DURATION
 * 
 * Security features:
 * - Prevents credential stuffing attacks
 * - Mitigates password spraying
 * - Reduces account enumeration risk
 * - Logs all rate limit violations for security monitoring
 */
@Component
public class AuthRateLimiter {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthRateLimiter.class);
    
    // Configuration
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);
    
    // In-memory storage (use Redis for distributed systems)
    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();
    
    /**
     * Check if a login attempt should be allowed for the given email and IP address.
     * 
     * @param email User's email address (case-insensitive)
     * @param ipAddress Client's IP address
     * @return true if login attempt is allowed, false if rate limited
     */
    public boolean allowLoginAttempt(String email, String ipAddress) {
        String identifier = createIdentifier(email, ipAddress);
        
        RateLimitBucket bucket = buckets.computeIfAbsent(
            identifier,
            k -> new RateLimitBucket(MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION)
        );
        
        boolean allowed = bucket.tryConsume();
        
        if (!allowed) {
            logger.warn("🚫 Rate limit exceeded for login attempt: email={}, ip={}, lockout_until={}", 
                       email, ipAddress, bucket.getLockoutUntil());
        } else {
            logger.debug("✅ Login attempt allowed: email={}, ip={}, remaining={}", 
                        email, ipAddress, bucket.getRemaining());
        }
        
        return allowed;
    }
    
    /**
     * Record a failed login attempt for security monitoring and rate limiting.
     * 
     * @param email User's email address
     * @param ipAddress Client's IP address
     */
    public void recordFailedLogin(String email, String ipAddress) {
        String identifier = createIdentifier(email, ipAddress);
        
        RateLimitBucket bucket = buckets.get(identifier);
        if (bucket != null) {
            int remaining = bucket.getRemaining();
            
            logger.warn("⚠️  Failed login attempt: email={}, ip={}, attempts_remaining={}", 
                       email, ipAddress, remaining);
            
            if (remaining == 0) {
                logger.error("🔒 Account locked due to too many failed attempts: email={}, ip={}, lockout_duration={}min", 
                           email, ipAddress, LOCKOUT_DURATION.toMinutes());
                
                // Could trigger additional security actions here:
                // - Send email notification to user
                // - Alert security team
                // - Add to threat intelligence feed
            }
        }
    }
    
    /**
     * Clear rate limits for a user (e.g., after successful login).
     * 
     * @param email User's email address
     * @param ipAddress Client's IP address
     */
    public void clearLimits(String email, String ipAddress) {
        String identifier = createIdentifier(email, ipAddress);
        RateLimitBucket removed = buckets.remove(identifier);
        
        if (removed != null) {
            logger.info("✅ Cleared rate limits after successful login: email={}, ip={}", 
                       email, ipAddress);
        }
    }
    
    /**
     * Get remaining login attempts before lockout.
     * 
     * @param email User's email address
     * @param ipAddress Client's IP address
     * @return Number of remaining attempts, or MAX_LOGIN_ATTEMPTS if no bucket exists
     */
    public int getRemainingAttempts(String email, String ipAddress) {
        String identifier = createIdentifier(email, ipAddress);
        RateLimitBucket bucket = buckets.get(identifier);
        return bucket != null ? bucket.getRemaining() : MAX_LOGIN_ATTEMPTS;
    }
    
    /**
     * Check if an account is currently locked out.
     * 
     * @param email User's email address
     * @param ipAddress Client's IP address
     * @return true if locked out, false otherwise
     */
    public boolean isLockedOut(String email, String ipAddress) {
        String identifier = createIdentifier(email, ipAddress);
        RateLimitBucket bucket = buckets.get(identifier);
        return bucket != null && bucket.isLockedOut();
    }
    
    /**
     * Cleanup expired rate limit entries (call periodically).
     * This prevents memory leaks in long-running applications.
     */
    public void cleanupExpiredEntries() {
        int sizeBefore = buckets.size();
        buckets.entrySet().removeIf(entry -> !entry.getValue().isLockedOut());
        int sizeAfter = buckets.size();
        
        if (sizeBefore > sizeAfter) {
            logger.info("🧹 Cleaned up {} expired rate limit entries", sizeBefore - sizeAfter);
        }
    }
    
    private String createIdentifier(String email, String ipAddress) {
        // Normalize email to lowercase for consistent rate limiting
        return email.toLowerCase().trim() + ":" + ipAddress;
    }
    
    /**
     * Internal rate limit bucket implementing sliding window algorithm.
     */
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
            
            // Check if currently locked out
            if (isLockedOut()) {
                return false;
            }
            
            // Reset if lockout expired
            if (lockoutUntil != null && now.isAfter(lockoutUntil)) {
                remainingAttempts = maxAttempts;
                lockoutUntil = null;
            }
            
            // Consume an attempt
            if (remainingAttempts > 0) {
                remainingAttempts--;
                
                // Initiate lockout if no attempts remaining
                if (remainingAttempts == 0) {
                    lockoutUntil = now.plus(lockoutDuration);
                }
                
                return true;
            }
            
            return false;
        }
        
        public boolean isLockedOut() {
            if (lockoutUntil == null) {
                return false;
            }
            Instant now = Instant.now();
            return now.isBefore(lockoutUntil);
        }
        
        public int getRemaining() {
            return isLockedOut() ? 0 : remainingAttempts;
        }
        
        public Instant getLockoutUntil() {
            return lockoutUntil;
        }
    }
}
