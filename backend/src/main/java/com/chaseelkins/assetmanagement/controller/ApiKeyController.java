package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.ApiKeyDTO;
import com.chaseelkins.assetmanagement.service.ApiKeyService;
import com.chaseelkins.assetmanagement.service.ApiKeyService.ApiKeyCreationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for API key management.
 * Allows users to create and manage API keys for external API access.
 */
@RestController
@RequestMapping("/api-keys")
@Tag(name = "API Keys", description = "API key management for external integrations")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    /**
     * Create a new API key for the authenticated user
     */
    @PostMapping
    @Operation(summary = "Create API key", 
               description = "Generate a new API key. The full key is only shown once!")
    public ResponseEntity<ApiKeyCreationResponse> createApiKey(
            @RequestBody CreateApiKeyRequest request,
            Authentication authentication) {
        
        // Get user ID from authentication
        Long userId = extractUserId(authentication);
        
        ApiKeyCreationResponse response = apiKeyService.createApiKey(
                request.getName(),
                request.getDescription(),
                request.getRateLimit(),
                request.getExpiresAt(),
                userId
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all API keys for the authenticated user
     */
    @GetMapping
    @Operation(summary = "Get user API keys", 
               description = "Get all API keys for the authenticated user")
    public ResponseEntity<List<ApiKeyDTO>> getUserApiKeys(Authentication authentication) {
        Long userId = extractUserId(authentication);
        List<ApiKeyDTO> apiKeys = apiKeyService.getUserApiKeys(userId);
        return ResponseEntity.ok(apiKeys);
    }

    /**
     * Get all API keys (Admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all API keys", 
               description = "Get all API keys across all users (Admin only)")
    public ResponseEntity<List<ApiKeyDTO>> getAllApiKeys() {
        List<ApiKeyDTO> apiKeys = apiKeyService.getAllApiKeys();
        return ResponseEntity.ok(apiKeys);
    }

    /**
     * Get API key by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get API key by ID", 
               description = "Get details of a specific API key")
    public ResponseEntity<ApiKeyDTO> getApiKeyById(
            @PathVariable Long id,
            Authentication authentication) {
        
        ApiKeyDTO apiKey = apiKeyService.getApiKeyById(id);
        
        // Verify user owns this key (or is admin)
        Long userId = extractUserId(authentication);
        if (!apiKey.getUserId().equals(userId) && !isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(apiKey);
    }

    /**
     * Update API key settings
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update API key", 
               description = "Update API key name, description, rate limit, or expiry")
    public ResponseEntity<ApiKeyDTO> updateApiKey(
            @PathVariable Long id,
            @RequestBody UpdateApiKeyRequest request,
            Authentication authentication) {
        
        // Verify ownership
        ApiKeyDTO existingKey = apiKeyService.getApiKeyById(id);
        Long userId = extractUserId(authentication);
        if (!existingKey.getUserId().equals(userId) && !isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        
        ApiKeyDTO updated = apiKeyService.updateApiKey(
                id,
                request.getName(),
                request.getDescription(),
                request.getRateLimit(),
                request.getExpiresAt()
        );
        
        return ResponseEntity.ok(updated);
    }

    /**
     * Revoke API key (set to inactive)
     */
    @PostMapping("/{id}/revoke")
    @Operation(summary = "Revoke API key", 
               description = "Deactivate an API key (can be reactivated)")
    public ResponseEntity<Map<String, String>> revokeApiKey(
            @PathVariable Long id,
            Authentication authentication) {
        
        // Verify ownership
        ApiKeyDTO existingKey = apiKeyService.getApiKeyById(id);
        Long userId = extractUserId(authentication);
        if (!existingKey.getUserId().equals(userId) && !isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        
        apiKeyService.revokeApiKey(id);
        return ResponseEntity.ok(Map.of(
                "message", "API key revoked successfully",
                "id", id.toString()
        ));
    }

    /**
     * Delete API key permanently
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete API key", 
               description = "Permanently delete an API key")
    public ResponseEntity<Map<String, String>> deleteApiKey(
            @PathVariable Long id,
            Authentication authentication) {
        
        // Verify ownership
        ApiKeyDTO existingKey = apiKeyService.getApiKeyById(id);
        Long userId = extractUserId(authentication);
        if (!existingKey.getUserId().equals(userId) && !isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        
        apiKeyService.deleteApiKey(id);
        return ResponseEntity.ok(Map.of(
                "message", "API key deleted successfully",
                "id", id.toString()
        ));
    }

    // Helper methods
    private Long extractUserId(Authentication authentication) {
        // This would typically extract from JWT or security context
        // For now, returning a placeholder - integrate with your JWT service
        return 1L; // TODO: Extract from JWT token
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }

    // Request DTOs
    public static class CreateApiKeyRequest {
        private String name;
        private String description;
        private Integer rateLimit;
        private LocalDateTime expiresAt;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getRateLimit() { return rateLimit; }
        public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    }

    public static class UpdateApiKeyRequest {
        private String name;
        private String description;
        private Integer rateLimit;
        private LocalDateTime expiresAt;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getRateLimit() { return rateLimit; }
        public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    }
}
