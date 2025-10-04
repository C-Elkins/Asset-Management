package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.model.UserConsent;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import com.chaseelkins.assetmanagement.repository.UserConsentRepository;
import com.chaseelkins.assetmanagement.tenant.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for GDPR/CCPA privacy compliance features.
 * Provides endpoints for data access, consent management, and privacy controls.
 */
@RestController
@RequestMapping("/privacy")
@Validated
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:3001", 
    "http://127.0.0.1:3001", 
    "http://localhost:5173", 
    "http://127.0.0.1:5173"
})
public class PrivacyController {

    private static final Logger log = LoggerFactory.getLogger(PrivacyController.class);
    
    private final UserRepository userRepository;
    private final UserConsentRepository consentRepository;
    private final MeterRegistry meterRegistry;

    public PrivacyController(UserRepository userRepository, UserConsentRepository consentRepository, MeterRegistry meterRegistry) {
        this.userRepository = userRepository;
        this.consentRepository = consentRepository;
        this.meterRegistry = meterRegistry;
    }

    /**
     * Get user's personal data (GDPR Article 15 - Right of Access)
     */
    @GetMapping("/my-data")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getMyPersonalData(Authentication auth) {
        try {
            String userEmail = auth.getName();
            Long tenantId = TenantContext.getTenantId();
            
            log.info("Personal data request from user: {} in tenant: {}", userEmail, tenantId);

            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                log.warn("User not found for email: {}", userEmail);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            
            // Verify user belongs to current tenant
            if (!user.getTenantId().equals(tenantId)) {
                log.warn("User {} attempted to access data from different tenant", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            Map<String, Object> personalData = new HashMap<>();
            personalData.put("user", mapUserData(user));
            personalData.put("consent", getCurrentConsent(user.getId(), tenantId));
            personalData.put("dataExportedAt", LocalDateTime.now());
            personalData.put("tenantId", tenantId);
            personalData.put("exportFormat", "JSON");

            log.info("Personal data export completed for user: {}", userEmail);
            return ResponseEntity.ok(personalData);

        } catch (Exception e) {
            log.error("Error retrieving personal data for user: {}", auth.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve personal data"));
        }
    }

    /**
     * Update user consent preferences (GDPR Article 7 - Consent)
     */
    @PutMapping("/consent")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> updateConsent(
            @Valid @RequestBody Map<String, Boolean> consentData,
            Authentication auth,
            HttpServletRequest request) {
        try {
            String userEmail = auth.getName();
            Long tenantId = TenantContext.getTenantId();
            
            log.info("Consent update request from user: {} in tenant: {}", userEmail, tenantId);

            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                log.warn("User not found for email: {}", userEmail);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            
            // Verify user belongs to current tenant
            if (!user.getTenantId().equals(tenantId)) {
                log.warn("User {} attempted to update consent from different tenant", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            UserConsent consent = consentRepository.findByUserIdAndTenantId(user.getId(), tenantId)
                .orElse(new UserConsent(user.getId(), tenantId));

            // Update consent preferences
            consent.setMarketingEmails(consentData.getOrDefault("marketingEmails", false));
            consent.setAnalytics(consentData.getOrDefault("analytics", false));
            consent.setDataProcessing(true); // Always required for app functionality
            
            // Record audit information
            consent.setConsentIpAddress(request.getRemoteAddr());
            consent.setConsentUserAgent(request.getHeader("User-Agent"));
            consent.setConsentVersion("1.0");

            UserConsent savedConsent = consentRepository.save(consent);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Consent preferences updated successfully");
            response.put("timestamp", LocalDateTime.now());
            response.put("consent", savedConsent);

            log.info("Consent updated for user: {} - Marketing: {}, Analytics: {}", 
                userEmail, savedConsent.isMarketingEmails(), savedConsent.isAnalytics());

            // Metrics: count consent updates with tenant and option tags
            try {
                String tenantTag = String.valueOf(tenantId);
                meterRegistry.counter(
                    "privacy.consent.updated",
                    "tenant", tenantTag,
                    "marketing", String.valueOf(savedConsent.isMarketingEmails()),
                    "analytics", String.valueOf(savedConsent.isAnalytics())
                ).increment();
            } catch (Exception metricsErr) {
                log.debug("Metrics error (consent.updated): {}", metricsErr.getMessage());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating consent for user: {}", auth.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update consent preferences"));
        }
    }

    /**
     * Get current consent status
     */
    @GetMapping("/consent")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserConsent> getConsentStatus(Authentication auth) {
        try {
            String userEmail = auth.getName();
            Long tenantId = TenantContext.getTenantId();
            
            log.debug("Consent status request from user: {} in tenant: {}", userEmail, tenantId);

            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                log.warn("User not found for email: {}", userEmail);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            User user = userOpt.get();
            
            // Verify user belongs to current tenant
            if (!user.getTenantId().equals(tenantId)) {
                log.warn("User {} attempted to access consent from different tenant", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            UserConsent consent = consentRepository.findByUserIdAndTenantId(user.getId(), tenantId)
                .orElse(defaultConsent(user.getId(), tenantId));

            return ResponseEntity.ok(consent);

        } catch (Exception e) {
            log.error("Error retrieving consent status for user: {}", auth.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Request data deletion (GDPR Article 17 - Right to Erasure)
     * Note: This is a request endpoint. Actual deletion should be handled by admin processes
     */
    @PostMapping("/request-deletion")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> requestDataDeletion(
            Authentication auth,
            HttpServletRequest request) {
        try {
            String userEmail = auth.getName();
            Long tenantId = TenantContext.getTenantId();
            
            log.info("Data deletion request from user: {} in tenant: {}", userEmail, tenantId);

            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                log.warn("User not found for email: {}", userEmail);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            
            // Verify user belongs to current tenant
            if (!user.getTenantId().equals(tenantId)) {
                log.warn("User {} attempted deletion request from different tenant", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            // Log the deletion request (in a real implementation, this would create a deletion job)
            log.info("Data deletion requested by user: {} (ID: {}) in tenant: {} from IP: {}", 
                userEmail, user.getId(), tenantId, request.getRemoteAddr());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Data deletion request submitted successfully");
            response.put("requestId", "DEL-" + System.currentTimeMillis());
            response.put("timestamp", LocalDateTime.now());
            response.put("note", "Your request will be processed within 30 days as required by GDPR/CCPA");

            // Metrics: count deletion requests per tenant
            try {
                String tenantTag = String.valueOf(tenantId);
                meterRegistry.counter("privacy.deletion.requested", "tenant", tenantTag).increment();
            } catch (Exception metricsErr) {
                log.debug("Metrics error (deletion.requested): {}", metricsErr.getMessage());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing deletion request for user: {}", auth.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to process deletion request"));
        }
    }

    /**
     * Get privacy policy status and compliance information
     */
    @GetMapping("/policy-status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getPolicyStatus(Authentication auth) {
        try {
            Long tenantId = TenantContext.getTenantId();
            
            Map<String, Object> status = new HashMap<>();
            status.put("currentPolicyVersion", "1.0");
            status.put("lastUpdated", LocalDateTime.now().minusDays(30)); // Example
            status.put("complianceFrameworks", new String[]{"GDPR", "CCPA", "PIPEDA"});
            status.put("tenantId", tenantId);
            status.put("dataRetentionPeriod", "7 years");
            status.put("contactEmail", "privacy@yourdomain.com");

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            log.error("Error retrieving policy status for user: {}", auth.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve policy status"));
        }
    }

    // Helper methods

    private Map<String, Object> mapUserData(User user) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("department", user.getDepartment());
        userData.put("jobTitle", user.getJobTitle());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("role", user.getRole());
        userData.put("active", user.getActive());
        userData.put("authProvider", user.getAuthProvider());
        userData.put("createdAt", user.getCreatedAt());
        userData.put("updatedAt", user.getUpdatedAt());
        userData.put("tenantId", user.getTenantId());
        return userData;
    }

    private UserConsent getCurrentConsent(Long userId, Long tenantId) {
        return consentRepository.findByUserIdAndTenantId(userId, tenantId)
            .orElse(defaultConsent(userId, tenantId));
    }

    private UserConsent defaultConsent(Long userId, Long tenantId) {
        UserConsent consent = new UserConsent(userId, tenantId);
        consent.setMarketingEmails(false);
        consent.setAnalytics(false);
        consent.setDataProcessing(true); // Required for app functionality
        consent.setConsentVersion("1.0");
        return consent; // Do NOT persist during read operations
    }
}
