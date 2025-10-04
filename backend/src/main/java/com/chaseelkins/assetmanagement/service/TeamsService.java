package com.chaseelkins.assetmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for sending notifications to Microsoft Teams via Incoming Webhooks.
 * Supports rich adaptive cards for better visual presentation.
 */
@Service
public class TeamsService {

    private static final Logger logger = LoggerFactory.getLogger(TeamsService.class);
    private final RestTemplate restTemplate;

    @Value("${teams.webhook.url:}")
    private String webhookUrl;

    @Value("${teams.notifications.enabled:false}")
    private boolean notificationsEnabled;

    public TeamsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Check if Teams is configured and enabled
     */
    public boolean isConfigured() {
        return notificationsEnabled && webhookUrl != null && !webhookUrl.isEmpty();
    }

    /**
     * Get configuration status
     */
    public Map<String, Object> getConfigurationStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", isConfigured());
        status.put("enabled", notificationsEnabled);
        status.put("webhookConfigured", webhookUrl != null && !webhookUrl.isEmpty());
        return status;
    }

    /**
     * Test the Teams connection
     */
    public boolean testConnection() {
        if (!isConfigured()) {
            logger.warn("Teams notifications not configured");
            return false;
        }

        try {
            sendCustomMessage("Connection Test", "✅ Microsoft Teams integration is working! You're all set to receive notifications.");
            return true;
        } catch (Exception e) {
            logger.error("Failed to test Teams connection", e);
            return false;
        }
    }

    /**
     * Send a custom message to Teams
     */
    public void sendCustomMessage(String title, String message) {
        if (!isConfigured()) {
            logger.debug("Teams notifications not configured, skipping message: {}", title);
            return;
        }

        try {
            Map<String, Object> card = buildAdaptiveCard(title, message, "accent");
            sendWebhook(card);
            logger.info("Teams notification sent: {}", title);
        } catch (Exception e) {
            logger.error("Failed to send Teams notification: {}", title, e);
            throw new RuntimeException("Failed to send Teams notification", e);
        }
    }

    /**
     * Send asset notification to Teams
     */
    public void sendAssetNotification(String title, String message, String assetName, String status) {
        if (!isConfigured()) {
            return;
        }

        try {
            Map<String, Object> card = buildAssetCard(title, message, assetName, status);
            sendWebhook(card);
            logger.info("Teams asset notification sent: {}", title);
        } catch (Exception e) {
            logger.error("Failed to send Teams asset notification", e);
        }
    }

    /**
     * Send maintenance alert to Teams
     */
    public void sendMaintenanceAlert(String assetName, String maintenanceType, String dueDate) {
        if (!isConfigured()) {
            return;
        }

        String title = "🔧 Maintenance Alert";
        String message = String.format("Asset **%s** requires %s maintenance", assetName, maintenanceType);
        
        try {
            Map<String, Object> card = buildMaintenanceCard(title, message, assetName, maintenanceType, dueDate);
            sendWebhook(card);
            logger.info("Teams maintenance alert sent for asset: {}", assetName);
        } catch (Exception e) {
            logger.error("Failed to send Teams maintenance alert", e);
        }
    }

    /**
     * Build a basic adaptive card
     */
    private Map<String, Object> buildAdaptiveCard(String title, String text, String color) {
        Map<String, Object> card = new HashMap<>();
        card.put("type", "message");
        card.put("attachments", new Object[]{
            Map.of(
                "contentType", "application/vnd.microsoft.card.adaptive",
                "content", Map.of(
                    "type", "AdaptiveCard",
                    "$schema", "http://adaptivecards.io/schemas/adaptive-card.json",
                    "version", "1.4",
                    "body", new Object[]{
                        Map.of(
                            "type", "TextBlock",
                            "text", title,
                            "weight", "bolder",
                            "size", "large",
                            "color", color
                        ),
                        Map.of(
                            "type", "TextBlock",
                            "text", text,
                            "wrap", true
                        )
                    }
                )
            )
        });
        return card;
    }

    /**
     * Build an asset notification card
     */
    private Map<String, Object> buildAssetCard(String title, String message, String assetName, String status) {
        Map<String, Object> card = new HashMap<>();
        card.put("type", "message");
        card.put("attachments", new Object[]{
            Map.of(
                "contentType", "application/vnd.microsoft.card.adaptive",
                "content", Map.of(
                    "type", "AdaptiveCard",
                    "$schema", "http://adaptivecards.io/schemas/adaptive-card.json",
                    "version", "1.4",
                    "body", new Object[]{
                        Map.of(
                            "type", "TextBlock",
                            "text", title,
                            "weight", "bolder",
                            "size", "large",
                            "color", "accent"
                        ),
                        Map.of(
                            "type", "TextBlock",
                            "text", message,
                            "wrap", true
                        ),
                        Map.of(
                            "type", "FactSet",
                            "facts", new Object[]{
                                Map.of("title", "Asset", "value", assetName),
                                Map.of("title", "Status", "value", status)
                            }
                        )
                    }
                )
            )
        });
        return card;
    }

    /**
     * Build a maintenance alert card
     */
    private Map<String, Object> buildMaintenanceCard(String title, String message, String assetName, 
                                                      String maintenanceType, String dueDate) {
        Map<String, Object> card = new HashMap<>();
        card.put("type", "message");
        card.put("attachments", new Object[]{
            Map.of(
                "contentType", "application/vnd.microsoft.card.adaptive",
                "content", Map.of(
                    "type", "AdaptiveCard",
                    "$schema", "http://adaptivecards.io/schemas/adaptive-card.json",
                    "version", "1.4",
                    "body", new Object[]{
                        Map.of(
                            "type", "TextBlock",
                            "text", title,
                            "weight", "bolder",
                            "size", "large",
                            "color", "warning"
                        ),
                        Map.of(
                            "type", "TextBlock",
                            "text", message,
                            "wrap", true
                        ),
                        Map.of(
                            "type", "FactSet",
                            "facts", new Object[]{
                                Map.of("title", "Asset", "value", assetName),
                                Map.of("title", "Type", "value", maintenanceType),
                                Map.of("title", "Due Date", "value", dueDate)
                            }
                        )
                    }
                )
            )
        });
        return card;
    }

    /**
     * Send webhook request to Teams
     */
    private void sendWebhook(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity(webhookUrl, request, String.class);
    }
}
