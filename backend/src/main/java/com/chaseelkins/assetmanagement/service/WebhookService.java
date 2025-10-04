package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.WebhookDTO;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.model.Webhook;
import com.chaseelkins.assetmanagement.model.Webhook.WebhookEvent;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import com.chaseelkins.assetmanagement.repository.WebhookRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);
    private static final int MAX_FAILURES_BEFORE_DISABLE = 10;

    private final WebhookRepository webhookRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public WebhookService(WebhookRepository webhookRepository,
                         UserRepository userRepository,
                         RestTemplate restTemplate,
                         ObjectMapper objectMapper) {
        this.webhookRepository = webhookRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Trigger webhooks asynchronously for a specific event
     */
    @Async
    public void triggerWebhooks(WebhookEvent event, Object payload) {
        List<Webhook> webhooks = webhookRepository.findByActiveTrueAndEventsContaining(event);
        
        if (webhooks.isEmpty()) {
            log.debug("No active webhooks configured for event: {}", event);
            return;
        }
        
        log.info("Triggering {} webhook(s) for event: {}", webhooks.size(), event);
        
        for (Webhook webhook : webhooks) {
            try {
                sendWebhook(webhook, event, payload);
            } catch (Exception e) {
                log.error("Failed to send webhook {}: {}", webhook.getName(), e.getMessage());
            }
        }
    }

    /**
     * Send individual webhook with signature and retry logic
     */
    private void sendWebhook(Webhook webhook, WebhookEvent event, Object payload) {
        try {
            // Create webhook payload
            WebhookDTO.WebhookPayload webhookPayload = new WebhookDTO.WebhookPayload();
            webhookPayload.setEvent(event.name());
            webhookPayload.setTimestamp(LocalDateTime.now());
            webhookPayload.setData(payload);
            webhookPayload.setWebhookId(webhook.getId().toString());
            
            String jsonPayload = objectMapper.writeValueAsString(webhookPayload);
            
            // Generate HMAC signature for security
            String signature = generateHmacSignature(jsonPayload, webhook.getSecret());
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Webhook-Signature", signature);
            headers.set("X-Webhook-Event", event.name());
            headers.set("X-Webhook-ID", webhook.getId().toString());
            headers.set("X-Webhook-Delivery-ID", UUID.randomUUID().toString());
            headers.set("User-Agent", "Krubles-Webhook/1.0");
            
            HttpEntity<String> request = new HttpEntity<>(jsonPayload, headers);
            
            // Send webhook
            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.postForEntity(
                webhook.getUrl(), 
                request, 
                String.class
            );
            long responseTime = System.currentTimeMillis() - startTime;
            
            // Log success
            log.info("Webhook '{}' triggered successfully: {} ({}ms)", 
                webhook.getName(), response.getStatusCode(), responseTime);
            
            // Update webhook stats
            webhook.setLastTriggeredAt(LocalDateTime.now());
            webhook.setFailureCount(0); // Reset failure count on success
            webhook.setLastError(null);
            webhookRepository.save(webhook);
            
        } catch (Exception e) {
            handleWebhookFailure(webhook, e);
        }
    }

    /**
     * Handle webhook delivery failure
     */
    private void handleWebhookFailure(Webhook webhook, Exception e) {
        log.error("Webhook '{}' failed: {}", webhook.getName(), e.getMessage());
        
        webhook.setFailureCount(webhook.getFailureCount() + 1);
        webhook.setLastError(e.getMessage());
        webhook.setLastTriggeredAt(LocalDateTime.now());
        
        // Auto-disable webhook after too many failures
        if (webhook.getFailureCount() >= MAX_FAILURES_BEFORE_DISABLE) {
            webhook.setActive(false);
            log.warn("Webhook '{}' disabled after {} consecutive failures", 
                webhook.getName(), webhook.getFailureCount());
        }
        
        webhookRepository.save(webhook);
    }

    /**
     * Generate HMAC-SHA256 signature for webhook payload
     */
    private String generateHmacSignature(String payload, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), 
                "HmacSHA256"
            );
            sha256Hmac.init(secretKey);
            
            byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return "sha256=" + Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate webhook signature", e);
        }
    }

    /**
     * Create a new webhook
     */
    public Webhook createWebhook(WebhookDTO.WebhookRequest request) {
        Webhook webhook = new Webhook();
        webhook.setName(request.getName());
        webhook.setUrl(request.getUrl());
        webhook.setEvents(request.getEvents());
        webhook.setActive(request.isActive());
        
        // Generate secure random secret
        webhook.setSecret(generateWebhookSecret());
        
        // Set creator
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            userRepository.findByUsername(username).ifPresent(webhook::setCreatedBy);
        }
        
        return webhookRepository.save(webhook);
    }

    /**
     * Update existing webhook
     */
    public Webhook updateWebhook(Long id, WebhookDTO.WebhookRequest request) {
        Webhook webhook = webhookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Webhook not found: " + id));
        
        webhook.setName(request.getName());
        webhook.setUrl(request.getUrl());
        webhook.setEvents(request.getEvents());
        webhook.setActive(request.isActive());
        
        return webhookRepository.save(webhook);
    }

    /**
     * Delete webhook
     */
    public void deleteWebhook(Long id) {
        webhookRepository.deleteById(id);
    }

    /**
     * Get all webhooks
     */
    public List<Webhook> getAllWebhooks() {
        return webhookRepository.findAll();
    }

    /**
     * Get webhook by ID
     */
    public Webhook getWebhookById(Long id) {
        return webhookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Webhook not found: " + id));
    }

    /**
     * Test webhook delivery
     */
    public WebhookDTO.WebhookTestResult testWebhook(Long id) {
        Webhook webhook = getWebhookById(id);
        
        WebhookDTO.WebhookTestResult result = new WebhookDTO.WebhookTestResult();
        
        try {
            // Create test payload
            WebhookDTO.WebhookPayload testPayload = new WebhookDTO.WebhookPayload();
            testPayload.setEvent("TEST");
            testPayload.setTimestamp(LocalDateTime.now());
            testPayload.setData("This is a test webhook delivery from Krubles");
            testPayload.setWebhookId(webhook.getId().toString());
            
            String jsonPayload = objectMapper.writeValueAsString(testPayload);
            String signature = generateHmacSignature(jsonPayload, webhook.getSecret());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Webhook-Signature", signature);
            headers.set("X-Webhook-Event", "TEST");
            headers.set("User-Agent", "Krubles-Webhook/1.0");
            
            HttpEntity<String> request = new HttpEntity<>(jsonPayload, headers);
            
            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.postForEntity(
                webhook.getUrl(), 
                request, 
                String.class
            );
            long responseTime = System.currentTimeMillis() - startTime;
            
            result.setSuccess(true);
            result.setStatusCode(response.getStatusCode().value());
            result.setMessage("Webhook test successful");
            result.setResponseTimeMs(responseTime);
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setStatusCode(0);
            result.setMessage("Webhook test failed: " + e.getMessage());
            result.setResponseTimeMs(0);
        }
        
        return result;
    }

    /**
     * Generate secure random webhook secret
     */
    private String generateWebhookSecret() {
        return UUID.randomUUID().toString() + UUID.randomUUID().toString();
    }

    /**
     * Convert Webhook entity to DTO
     */
    public WebhookDTO.WebhookResponse toDTO(Webhook webhook) {
        WebhookDTO.WebhookResponse dto = new WebhookDTO.WebhookResponse();
        dto.setId(webhook.getId());
        dto.setName(webhook.getName());
        dto.setUrl(webhook.getUrl());
        dto.setEvents(webhook.getEvents());
        dto.setActive(webhook.isActive());
        dto.setCreatedAt(webhook.getCreatedAt());
        dto.setCreatedBy(webhook.getCreatedBy() != null ? webhook.getCreatedBy().getUsername() : null);
        dto.setLastTriggeredAt(webhook.getLastTriggeredAt());
        dto.setFailureCount(webhook.getFailureCount());
        dto.setLastError(webhook.getLastError());
        return dto;
    }
}
