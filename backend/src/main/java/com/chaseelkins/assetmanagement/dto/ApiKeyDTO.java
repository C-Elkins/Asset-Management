package com.chaseelkins.assetmanagement.dto;

import java.time.LocalDateTime;

public class ApiKeyDTO {
    
    private Long id;
    private String name;
    private String prefix; // Only show prefix, never full key
    private String description;
    private boolean active;
    private Integer rateLimit;
    private LocalDateTime lastUsedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private Long userId;
    private String userEmail;

    // Constructors
    public ApiKeyDTO() {
    }

    public ApiKeyDTO(Long id, String name, String prefix, String description, boolean active, 
                     Integer rateLimit, LocalDateTime lastUsedAt, LocalDateTime expiresAt, 
                     LocalDateTime createdAt, Long userId, String userEmail) {
        this.id = id;
        this.name = name;
        this.prefix = prefix;
        this.description = description;
        this.active = active;
        this.rateLimit = rateLimit;
        this.lastUsedAt = lastUsedAt;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.userId = userId;
        this.userEmail = userEmail;
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

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}
