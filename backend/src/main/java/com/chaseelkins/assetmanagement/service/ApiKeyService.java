package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.ApiKeyDTO;
import com.chaseelkins.assetmanagement.model.ApiKey;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.ApiKeyRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing API keys.
 * Handles creation, validation, and lifecycle management of API keys.
 */
@Service
@Transactional
public class ApiKeyService {

    private static final Logger logger = LoggerFactory.getLogger(ApiKeyService.class);

    private final ApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String environment;

    public ApiKeyService(
            ApiKeyRepository apiKeyRepository, 
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${spring.profiles.active:dev}") String environment) {
        this.apiKeyRepository = apiKeyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    /**
     * Create a new API key for a user
     * @return DTO containing the FULL API key (only returned once!)
     */
    public ApiKeyCreationResponse createApiKey(String name, String description, Integer rateLimit, LocalDateTime expiresAt, Long userId) {
        logger.info("Creating API key '{}' for user {}", name, userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Validate name uniqueness
        if (apiKeyRepository.existsByName(name)) {
            throw new IllegalArgumentException("API key with name '" + name + "' already exists");
        }

        // Generate API key
        String fullApiKey = ApiKey.generateApiKey(environment);
        String prefix = ApiKey.extractPrefix(fullApiKey);
        String keyHash = passwordEncoder.encode(fullApiKey);

        // Create entity
        ApiKey apiKey = new ApiKey(name, keyHash, prefix, user);
        apiKey.setDescription(description);
        apiKey.setRateLimit(rateLimit != null ? rateLimit : 1000);
        apiKey.setExpiresAt(expiresAt);

        ApiKey savedKey = apiKeyRepository.save(apiKey);
        logger.info("Created API key with ID {} and prefix {}", savedKey.getId(), savedKey.getPrefix());

        // Return response with FULL key (only time it's visible!)
        return new ApiKeyCreationResponse(
                savedKey.getId(),
                savedKey.getName(),
                fullApiKey, // ⚠️ ONLY TIME WE RETURN THIS!
                savedKey.getPrefix(),
                savedKey.getDescription(),
                savedKey.getRateLimit(),
                savedKey.getExpiresAt(),
                savedKey.getCreatedAt()
        );
    }

    /**
     * Validate API key and return associated API key entity
     */
    public Optional<ApiKey> validateApiKey(String fullApiKey) {
        if (fullApiKey == null || fullApiKey.length() < 16) {
            return Optional.empty();
        }

        try {
            String prefix = ApiKey.extractPrefix(fullApiKey);
            Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByPrefix(prefix);

            if (apiKeyOpt.isEmpty()) {
                return Optional.empty();
            }

            ApiKey apiKey = apiKeyOpt.get();

            // Check if key is valid (active and not expired)
            if (!apiKey.isValid()) {
                logger.warn("API key {} is invalid (active: {}, expired: {})", 
                        prefix, apiKey.isActive(), apiKey.isExpired());
                return Optional.empty();
            }

            // Verify key matches hash
            if (!passwordEncoder.matches(fullApiKey, apiKey.getKeyHash())) {
                logger.warn("API key {} failed hash verification", prefix);
                return Optional.empty();
            }

            // Update last used timestamp
            apiKey.setLastUsedAt(LocalDateTime.now());
            apiKeyRepository.save(apiKey);

            return Optional.of(apiKey);
        } catch (Exception e) {
            logger.error("Error validating API key", e);
            return Optional.empty();
        }
    }

    /**
     * Get all API keys for a user
     */
    @Transactional(readOnly = true)
    public List<ApiKeyDTO> getUserApiKeys(Long userId) {
        return apiKeyRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all API keys (admin only)
     */
    @Transactional(readOnly = true)
    public List<ApiKeyDTO> getAllApiKeys() {
        return apiKeyRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get API key by ID
     */
    @Transactional(readOnly = true)
    public ApiKeyDTO getApiKeyById(Long id) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API key not found with ID: " + id));
        return toDTO(apiKey);
    }

    /**
     * Revoke API key (set to inactive)
     */
    public void revokeApiKey(Long id) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API key not found with ID: " + id));
        
        apiKey.setActive(false);
        apiKeyRepository.save(apiKey);
        logger.info("Revoked API key {}", apiKey.getPrefix());
    }

    /**
     * Delete API key permanently
     */
    public void deleteApiKey(Long id) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API key not found with ID: " + id));
        
        apiKeyRepository.delete(apiKey);
        logger.info("Deleted API key {}", apiKey.getPrefix());
    }

    /**
     * Update API key settings
     */
    public ApiKeyDTO updateApiKey(Long id, String name, String description, Integer rateLimit, LocalDateTime expiresAt) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API key not found with ID: " + id));

        if (name != null && !name.equals(apiKey.getName())) {
            if (apiKeyRepository.existsByName(name)) {
                throw new IllegalArgumentException("API key with name '" + name + "' already exists");
            }
            apiKey.setName(name);
        }

        if (description != null) {
            apiKey.setDescription(description);
        }

        if (rateLimit != null) {
            apiKey.setRateLimit(rateLimit);
        }

        if (expiresAt != null) {
            apiKey.setExpiresAt(expiresAt);
        }

        ApiKey updated = apiKeyRepository.save(apiKey);
        logger.info("Updated API key {}", updated.getPrefix());
        
        return toDTO(updated);
    }

    // Helper methods
    private ApiKeyDTO toDTO(ApiKey apiKey) {
        return new ApiKeyDTO(
                apiKey.getId(),
                apiKey.getName(),
                apiKey.getPrefix(),
                apiKey.getDescription(),
                apiKey.isActive(),
                apiKey.getRateLimit(),
                apiKey.getLastUsedAt(),
                apiKey.getExpiresAt(),
                apiKey.getCreatedAt(),
                apiKey.getUser().getId(),
                apiKey.getUser().getEmail()
        );
    }

    /**
     * Response DTO for API key creation (includes full key)
     */
    public static class ApiKeyCreationResponse {
        private final Long id;
        private final String name;
        private final String apiKey; // Full key - only returned once!
        private final String prefix;
        private final String description;
        private final Integer rateLimit;
        private final LocalDateTime expiresAt;
        private final LocalDateTime createdAt;

        public ApiKeyCreationResponse(Long id, String name, String apiKey, String prefix, 
                                     String description, Integer rateLimit, 
                                     LocalDateTime expiresAt, LocalDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.apiKey = apiKey;
            this.prefix = prefix;
            this.description = description;
            this.rateLimit = rateLimit;
            this.expiresAt = expiresAt;
            this.createdAt = createdAt;
        }

        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getApiKey() { return apiKey; }
        public String getPrefix() { return prefix; }
        public String getDescription() { return description; }
        public Integer getRateLimit() { return rateLimit; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
