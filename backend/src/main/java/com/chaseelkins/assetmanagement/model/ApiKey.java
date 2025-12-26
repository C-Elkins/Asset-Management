package com.chaseelkins.assetmanagement.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing an API key for external API access.
 * API keys allow third-party applications to authenticate and access the API.
 */
@Entity
@Table(name = "api_keys", indexes = {
    @Index(name = "idx_api_keys_tenant", columnList = "tenant_id")
})
@EntityListeners(AuditingEntityListener.class)
public class ApiKey extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 64)
    private String keyHash; // Hashed API key for security

    @Column(nullable = false, unique = true, length = 16)
    private String prefix; // First 8 chars visible to user (e.g., "ak_test_12345678...")

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "rate_limit")
    private Integer rateLimit = 1000; // Requests per hour

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(length = 500)
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public ApiKey() {
    }

    public ApiKey(String name, String keyHash, String prefix, User user) {
        this.name = name;
        this.keyHash = keyHash;
        this.prefix = prefix;
        this.user = user;
        this.active = true;
        this.rateLimit = 1000;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKeyHash() {
        return keyHash;
    }

    public void setKeyHash(String keyHash) {
        this.keyHash = keyHash;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(Integer rateLimit) {
        this.rateLimit = rateLimit;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return active && !isExpired();
    }

    /**
     * Generate a new API key with format: ak_[env]_[random32chars]
     * Environment prefix: test for dev, live for prod
     */
    public static String generateApiKey(String environment) {
        String env = environment != null && environment.equals("prod") ? "live" : "test";
        String randomPart = UUID.randomUUID().toString().replace("-", "") + 
                           UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return "ak_" + env + "_" + randomPart;
    }

    /**
     * Extract prefix from full API key (first 16 characters)
     */
    public static String extractPrefix(String apiKey) {
        if (apiKey == null || apiKey.length() < 16) {
            throw new IllegalArgumentException("Invalid API key format");
        }
        return apiKey.substring(0, 16);
    }

    @Override
    public String toString() {
        return "ApiKey{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", prefix='" + prefix + '\'' +
                ", active=" + active +
                ", rateLimit=" + rateLimit +
                ", expiresAt=" + expiresAt +
                '}';
    }
}
