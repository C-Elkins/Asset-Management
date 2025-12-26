package com.chaseelkins.assetmanagement.dto;

import com.chaseelkins.assetmanagement.model.Webhook.WebhookEvent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

public class WebhookDTO {
    
    @Data
    public static class WebhookRequest {
        @NotBlank(message = "Name is required")
        private String name;
        
        @NotBlank(message = "URL is required")
        @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://")
        private String url;
        
        @NotEmpty(message = "At least one event is required")
        private Set<WebhookEvent> events;
        
        private boolean active = true;
    }
    
    @Data
    public static class WebhookResponse {
        private Long id;
        private String name;
        private String url;
        private Set<WebhookEvent> events;
        private boolean active;
        private LocalDateTime createdAt;
        private String createdBy;
        private LocalDateTime lastTriggeredAt;
        private int failureCount;
        private String lastError;
    }
    
    @Data
    public static class WebhookPayload {
        private String event;
        private LocalDateTime timestamp;
        private Object data;
        private String webhookId;
    }
    
    @Data
    public static class WebhookTestResult {
        private boolean success;
        private int statusCode;
        private String message;
        private long responseTimeMs;
    }
}
