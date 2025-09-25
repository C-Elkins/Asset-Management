package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.RefreshToken;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.RefreshTokenRepository;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
@Transactional
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final HexFormat HEX = HexFormat.of();

    private final RefreshTokenRepository repository;
    private final long refreshExpirationMillis;

    public RefreshTokenService(RefreshTokenRepository repository,
                               @Value("${jwt.refresh-expiration:604800000}") long refreshExpirationMillis) { // default 7 days
        this.repository = repository;
        this.refreshExpirationMillis = refreshExpirationMillis;
    }

    public GeneratedToken generate(User user, String userAgent, String ipAddress) {
        String raw = generateRawToken();
        String hash = hash(raw);
        RefreshToken token = new RefreshToken();
        token.setTokenHash(hash);
        token.setUser(user);
        token.setExpiresAt(Instant.now().plusMillis(refreshExpirationMillis));
        token.setUserAgent(truncate(userAgent, 255));
        token.setIpAddress(truncate(ipAddress, 64));
        repository.save(token);
        log.debug("Issued refresh token {} for user {}", token.getId(), user.getUsername());
        return new GeneratedToken(raw, token);
    }

    public GeneratedToken rotate(String rawToken, String userAgent, String ipAddress) {
        RefreshToken current = validateAndGet(rawToken);
        // Mark current revoked
        current.setRevokedAt(Instant.now());
        repository.save(current);
        // Issue new
        GeneratedToken gen = generate(current.getUser(), userAgent, ipAddress);
        current.setReplacedBy(gen.entity().getId().toString());
        repository.save(current);
        return gen;
    }

    public RefreshToken validateAndGet(String rawToken) {
        String hash = hash(rawToken);
        Optional<RefreshToken> opt = repository.findByTokenHashAndRevokedAtIsNull(hash);
        RefreshToken token = opt.orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (token.isExpired()) {
            throw new IllegalArgumentException("Refresh token expired");
        }
        return token;
    }

    public void revokeAllForUser(User user) {
        repository.findAllByUserAndRevokedAtIsNull(user).forEach(rt -> {
            rt.setRevokedAt(Instant.now());
            repository.save(rt);
        });
    }

    public void revoke(String rawToken) {
        try {
            RefreshToken token = validateAndGet(rawToken);
            token.setRevokedAt(Instant.now());
            repository.save(token);
        } catch (IllegalArgumentException ex) {
            log.debug("Attempted to revoke invalid/expired refresh token: {}", ex.getMessage());
        }
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32]; // 256 bits
        SECURE_RANDOM.nextBytes(bytes);
        return HEX.formatHex(bytes);
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HEX.formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }

    public record GeneratedToken(String raw, RefreshToken entity) {}
}
