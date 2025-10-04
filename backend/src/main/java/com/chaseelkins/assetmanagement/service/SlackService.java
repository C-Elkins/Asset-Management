package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.MaintenanceRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for sending notifications to Slack via Incoming Webhooks.
 * This service is used by admins in the dashboard to configure Slack notifications.
 * NOT visible on marketing pages - backend functionality only.
 */
@Service
public class SlackService {

    private static final Logger logger = LoggerFactory.getLogger(SlackService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${slack.webhook.url:}")
    private String slackWebhookUrl;

    @Value("${slack.notifications.enabled:false}")
    private boolean notificationsEnabled;

    public SlackService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Send asset created notification
     */
    @Async
    public void sendAssetCreatedNotification(Asset asset) {
        if (!isConfigured()) {
            logger.debug("Slack not configured, skipping notification");
            return;
        }

        try {
            String message = String.format(
                "🆕 *New Asset Created*\n" +
                "• *Name:* %s\n" +
                "• *Asset Tag:* %s\n" +
                "• *Category:* %s\n" +
                "• *Status:* %s\n" +
                "• *Location:* %s",
                asset.getName(),
                asset.getAssetTag(),
                asset.getCategory() != null ? asset.getCategory().getName() : "Not specified",
                asset.getStatus(),
                asset.getLocation() != null ? asset.getLocation() : "Not specified"
            );

            sendMessage(message);
            logger.info("Sent Slack notification for asset created: {}", asset.getName());
        } catch (Exception e) {
            logger.error("Failed to send Slack notification for asset created", e);
        }
    }

    /**
     * Send asset updated notification
     */
    @Async
    public void sendAssetUpdatedNotification(Asset asset) {
        if (!isConfigured()) {
            return;
        }

        try {
            String message = String.format(
                "✏️ *Asset Updated*\n" +
                "• *Name:* %s\n" +
                "• *Asset Tag:* %s\n" +
                "• *Status:* %s\n" +
                "• *Location:* %s",
                asset.getName(),
                asset.getAssetTag(),
                asset.getStatus(),
                asset.getLocation() != null ? asset.getLocation() : "Not specified"
            );

            sendMessage(message);
            logger.debug("Sent Slack notification for asset updated: {}", asset.getName());
        } catch (Exception e) {
            logger.error("Failed to send Slack notification for asset updated", e);
        }
    }

    /**
     * Send asset assigned notification
     */
    @Async
    public void sendAssetAssignedNotification(Asset asset, String assignedToName) {
        if (!isConfigured()) {
            return;
        }

        try {
            String message = String.format(
                "👤 *Asset Assigned*\n" +
                "• *Asset:* %s (%s)\n" +
                "• *Assigned To:* %s\n" +
                "• *Status:* %s\n" +
                "• *Location:* %s",
                asset.getName(),
                asset.getAssetTag(),
                assignedToName,
                asset.getStatus(),
                asset.getLocation() != null ? asset.getLocation() : "Not specified"
            );

            sendMessage(message);
            logger.info("Sent Slack notification for asset assigned: {} to {}", asset.getName(), assignedToName);
        } catch (Exception e) {
            logger.error("Failed to send Slack notification for asset assigned", e);
        }
    }

    /**
     * Send maintenance scheduled notification
     */
    @Async
    public void sendMaintenanceScheduledNotification(Asset asset, LocalDate scheduledDate) {
        if (!isConfigured()) {
            return;
        }

        try {
            String message = String.format(
                "🔧 *Maintenance Scheduled*\n" +
                "• *Asset:* %s (%s)\n" +
                "• *Scheduled Date:* %s\n" +
                "• *Current Status:* %s\n" +
                "• *Location:* %s",
                asset.getName(),
                asset.getAssetTag(),
                scheduledDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                asset.getStatus(),
                asset.getLocation() != null ? asset.getLocation() : "Not specified"
            );

            sendMessage(message);
            logger.info("Sent Slack notification for maintenance scheduled: {}", asset.getName());
        } catch (Exception e) {
            logger.error("Failed to send Slack notification for maintenance scheduled", e);
        }
    }

    /**
     * Send maintenance completed notification
     */
    @Async
    public void sendMaintenanceCompletedNotification(Asset asset, MaintenanceRecord record) {
        if (!isConfigured()) {
            return;
        }

        try {
            String message = String.format(
                "✅ *Maintenance Completed*\n" +
                "• *Asset:* %s (%s)\n" +
                "• *Completed Date:* %s\n" +
                "• *Status:* %s\n" +
                "• *Notes:* %s",
                asset.getName(),
                asset.getAssetTag(),
                LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE),
                asset.getStatus(),
                record.getDescription() != null ? record.getDescription() : "No notes provided"
            );

            sendMessage(message);
            logger.info("Sent Slack notification for maintenance completed: {}", asset.getName());
        } catch (Exception e) {
            logger.error("Failed to send Slack notification for maintenance completed", e);
        }
    }

    /**
     * Send warranty expiring soon notification
     */
    @Async
    public void sendWarrantyExpiringNotification(List<Asset> assets) {
        if (!isConfigured() || assets.isEmpty()) {
            return;
        }

        try {
            StringBuilder message = new StringBuilder("⚠️ *Warranties Expiring Soon*\n");
            message.append(String.format("_%d assets have warranties expiring within 30 days_\n\n", assets.size()));

            int count = 0;
            for (Asset asset : assets) {
                if (count >= 10) {
                    message.append(String.format("_...and %d more_", assets.size() - 10));
                    break;
                }
                message.append(String.format(
                    "• %s (%s) - Expires: %s\n",
                    asset.getName(),
                    asset.getAssetTag(),
                    asset.getWarrantyExpiry().format(DateTimeFormatter.ISO_LOCAL_DATE)
                ));
                count++;
            }

            sendMessage(message.toString());
            logger.info("Sent Slack notification for {} warranties expiring", assets.size());
        } catch (Exception e) {
            logger.error("Failed to send Slack notification for warranties expiring", e);
        }
    }

    /**
     * Send maintenance due notification
     */
    @Async
    public void sendMaintenanceDueNotification(List<Asset> assets) {
        if (!isConfigured() || assets.isEmpty()) {
            return;
        }

        try {
            StringBuilder message = new StringBuilder("🔧 *Maintenance Due Soon*\n");
            message.append(String.format("_%d assets need maintenance within 7 days_\n\n", assets.size()));

            int count = 0;
            for (Asset asset : assets) {
                if (count >= 10) {
                    message.append(String.format("_...and %d more_", assets.size() - 10));
                    break;
                }
                message.append(String.format(
                    "• %s (%s) - Due: %s\n",
                    asset.getName(),
                    asset.getAssetTag(),
                    asset.getNextMaintenance().format(DateTimeFormatter.ISO_LOCAL_DATE)
                ));
                count++;
            }

            sendMessage(message.toString());
            logger.info("Sent Slack notification for {} assets needing maintenance", assets.size());
        } catch (Exception e) {
            logger.error("Failed to send Slack notification for maintenance due", e);
        }
    }

    /**
     * Send custom message to Slack
     */
    @Async
    public void sendCustomMessage(String title, String message) {
        if (!isConfigured()) {
            return;
        }

        try {
            String formattedMessage = String.format("*%s*\n%s", title, message);
            sendMessage(formattedMessage);
            logger.info("Sent custom Slack notification: {}", title);
        } catch (Exception e) {
            logger.error("Failed to send custom Slack notification", e);
        }
    }

    /**
     * Test Slack connection
     */
    public boolean testConnection() {
        if (!isConfigured()) {
            return false;
        }

        try {
            String testMessage = "✅ *Slack Integration Test*\n" +
                "Your Krubles Asset Management system is successfully connected to Slack!";
            sendMessage(testMessage);
            return true;
        } catch (Exception e) {
            logger.error("Slack connection test failed", e);
            return false;
        }
    }

    /**
     * Send message to Slack webhook
     */
    private void sendMessage(String text) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("text", text);
            payload.put("username", "Krubles Asset Manager");
            payload.put("icon_emoji", ":clipboard:");

            String jsonPayload = objectMapper.writeValueAsString(payload);

            restTemplate.postForEntity(slackWebhookUrl, jsonPayload, String.class);
        } catch (Exception e) {
            logger.error("Failed to send message to Slack", e);
            throw new RuntimeException("Failed to send Slack notification", e);
        }
    }

    /**
     * Check if Slack is configured
     */
    public boolean isConfigured() {
        return notificationsEnabled && 
               slackWebhookUrl != null && 
               !slackWebhookUrl.isEmpty() && 
               slackWebhookUrl.startsWith("https://hooks.slack.com/");
    }

    /**
     * Get Slack configuration status
     */
    public Map<String, Object> getConfigurationStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", notificationsEnabled);
        status.put("configured", isConfigured());
        status.put("webhookConfigured", slackWebhookUrl != null && !slackWebhookUrl.isEmpty());
        return status;
    }
}
