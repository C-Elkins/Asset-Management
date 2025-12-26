package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for sending email notifications about asset events.
 * Supports HTML emails with branded templates.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    private final JavaMailSender mailSender;
    private final boolean emailEnabled;
    private final String fromEmail;
    private final String appUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${email.notifications.enabled:false}") boolean emailEnabled,
            @Value("${email.from:noreply@krubles.com}") String fromEmail,
            @Value("${app.url:http://localhost:3001}") String appUrl) {
        this.mailSender = mailSender;
        this.emailEnabled = emailEnabled;
        this.fromEmail = fromEmail;
        this.appUrl = appUrl;
    }

    /**
     * Send email notification when an asset is created
     */
    @Async
    public void sendAssetCreatedEmail(Asset asset, String recipientEmail, String recipientName) {
        if (!isConfigured()) {
            logger.debug("Email notifications not configured, skipping asset created email");
            return;
        }

        try {
            String subject = "New Asset Created: " + asset.getName();
            String body = buildAssetCreatedEmailBody(asset, recipientName);
            sendHtmlEmail(recipientEmail, subject, body);
            logger.info("Sent asset created email for asset {} to {}", asset.getId(), recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send asset created email for asset {}", asset.getId(), e);
        }
    }

    /**
     * Send email notification when an asset is assigned to a user
     */
    @Async
    public void sendAssetAssignedEmail(Asset asset, User assignedUser) {
        if (!isConfigured()) {
            logger.debug("Email notifications not configured, skipping asset assigned email");
            return;
        }

        try {
            String subject = "Asset Assigned to You: " + asset.getName();
            String body = buildAssetAssignedEmailBody(asset, assignedUser);
            sendHtmlEmail(assignedUser.getEmail(), subject, body);
            logger.info("Sent asset assigned email for asset {} to user {}", asset.getId(), assignedUser.getId());
        } catch (Exception e) {
            logger.error("Failed to send asset assigned email for asset {}", asset.getId(), e);
        }
    }

    /**
     * Send email notification when maintenance is scheduled
     */
    @Async
    public void sendMaintenanceScheduledEmail(Asset asset, LocalDate maintenanceDate, String recipientEmail, String recipientName) {
        if (!isConfigured()) {
            logger.debug("Email notifications not configured, skipping maintenance scheduled email");
            return;
        }

        try {
            String subject = "Maintenance Scheduled: " + asset.getName();
            String body = buildMaintenanceScheduledEmailBody(asset, maintenanceDate, recipientName);
            sendHtmlEmail(recipientEmail, subject, body);
            logger.info("Sent maintenance scheduled email for asset {} to {}", asset.getId(), recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send maintenance scheduled email for asset {}", asset.getId(), e);
        }
    }

    /**
     * Send email notification when maintenance is completed
     */
    @Async
    public void sendMaintenanceCompletedEmail(Asset asset, String recipientEmail, String recipientName) {
        if (!isConfigured()) {
            logger.debug("Email notifications not configured, skipping maintenance completed email");
            return;
        }

        try {
            String subject = "Maintenance Completed: " + asset.getName();
            String body = buildMaintenanceCompletedEmailBody(asset, recipientName);
            sendHtmlEmail(recipientEmail, subject, body);
            logger.info("Sent maintenance completed email for asset {} to {}", asset.getId(), recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send maintenance completed email for asset {}", asset.getId(), e);
        }
    }

    /**
     * Send email notification for expiring warranties (digest)
     */
    @Async
    public void sendWarrantyExpiringEmail(List<Asset> assets, String recipientEmail, String recipientName) {
        if (!isConfigured() || assets.isEmpty()) {
            return;
        }

        try {
            String subject = assets.size() + " Assets with Expiring Warranties";
            String body = buildWarrantyExpiringEmailBody(assets, recipientName);
            sendHtmlEmail(recipientEmail, subject, body);
            logger.info("Sent warranty expiring email with {} assets to {}", assets.size(), recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send warranty expiring email", e);
        }
    }

    /**
     * Send email notification for overdue maintenance (digest)
     */
    @Async
    public void sendMaintenanceDueEmail(List<Asset> assets, String recipientEmail, String recipientName) {
        if (!isConfigured() || assets.isEmpty()) {
            return;
        }

        try {
            String subject = assets.size() + " Assets Need Maintenance";
            String body = buildMaintenanceDueEmailBody(assets, recipientName);
            sendHtmlEmail(recipientEmail, subject, body);
            logger.info("Sent maintenance due email with {} assets to {}", assets.size(), recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send maintenance due email", e);
        }
    }

    /**
     * Send welcome email to new users
     */
    @Async
    public void sendWelcomeEmail(User user) {
        if (!isConfigured()) {
            logger.debug("Email notifications not configured, skipping welcome email");
            return;
        }

        try {
            String subject = "Welcome to Krubles Asset Management!";
            String body = buildWelcomeEmailBody(user);
            sendHtmlEmail(user.getEmail(), subject, body);
            logger.info("Sent welcome email to user {}", user.getId());
        } catch (Exception e) {
            logger.error("Failed to send welcome email to user {}", user.getId(), e);
        }
    }

    /**
     * Send a custom email
     */
    public void sendCustomEmail(String to, String subject, String body) {
        if (!isConfigured()) {
            throw new IllegalStateException("Email notifications are not configured");
        }

        try {
            sendHtmlEmail(to, subject, body);
            logger.info("Sent custom email to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send custom email to {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    private String buildAssetCreatedEmailBody(Asset asset, String recipientName) {
        return buildEmailTemplate(
                "New Asset Created",
                "Hi " + recipientName + ",",
                "A new asset has been added to the system:",
                buildAssetDetailsHtml(asset),
                "View Asset",
                appUrl + "/app/assets/" + asset.getId()
        );
    }

    private String buildAssetAssignedEmailBody(Asset asset, User user) {
        return buildEmailTemplate(
                "Asset Assigned to You",
                "Hi " + user.getFirstName() + ",",
                "An asset has been assigned to you:",
                buildAssetDetailsHtml(asset),
                "View Asset",
                appUrl + "/app/assets/" + asset.getId()
        );
    }

    private String buildMaintenanceScheduledEmailBody(Asset asset, LocalDate maintenanceDate, String recipientName) {
        String dateStr = maintenanceDate.format(DATE_FORMATTER);
        return buildEmailTemplate(
                "Maintenance Scheduled",
                "Hi " + recipientName + ",",
                "Maintenance has been scheduled for " + dateStr + ":",
                buildAssetDetailsHtml(asset),
                "View Asset",
                appUrl + "/app/assets/" + asset.getId()
        );
    }

    private String buildMaintenanceCompletedEmailBody(Asset asset, String recipientName) {
        return buildEmailTemplate(
                "Maintenance Completed",
                "Hi " + recipientName + ",",
                "Maintenance has been completed for:",
                buildAssetDetailsHtml(asset),
                "View Asset",
                appUrl + "/app/assets/" + asset.getId()
        );
    }

    private String buildWarrantyExpiringEmailBody(List<Asset> assets, String recipientName) {
        StringBuilder assetsList = new StringBuilder();
        assetsList.append("<ul style='margin: 20px 0; padding-left: 20px;'>");
        for (Asset asset : assets) {
            String warrantyDate = asset.getWarrantyExpiry() != null 
                ? asset.getWarrantyExpiry().format(DATE_FORMATTER) 
                : "Unknown";
            assetsList.append("<li style='margin: 10px 0;'>")
                    .append("<strong>").append(asset.getName()).append("</strong>")
                    .append(" - Expires: ").append(warrantyDate)
                    .append("</li>");
        }
        assetsList.append("</ul>");

        return buildEmailTemplate(
                "Warranties Expiring Soon",
                "Hi " + recipientName + ",",
                "The following assets have warranties expiring within 30 days:",
                assetsList.toString(),
                "View All Assets",
                appUrl + "/app/assets"
        );
    }

    private String buildMaintenanceDueEmailBody(List<Asset> assets, String recipientName) {
        StringBuilder assetsList = new StringBuilder();
        assetsList.append("<ul style='margin: 20px 0; padding-left: 20px;'>");
        for (Asset asset : assets) {
            String maintenanceDate = asset.getNextMaintenance() != null 
                ? asset.getNextMaintenance().format(DATE_FORMATTER) 
                : "Overdue";
            assetsList.append("<li style='margin: 10px 0;'>")
                    .append("<strong>").append(asset.getName()).append("</strong>")
                    .append(" - Due: ").append(maintenanceDate)
                    .append("</li>");
        }
        assetsList.append("</ul>");

        return buildEmailTemplate(
                "Maintenance Due",
                "Hi " + recipientName + ",",
                "The following assets need maintenance:",
                assetsList.toString(),
                "View Maintenance",
                appUrl + "/app/maintenance"
        );
    }

    private String buildWelcomeEmailBody(User user) {
        String content = "<p style='margin: 15px 0; color: #4b5563; line-height: 1.6;'>" +
                "Your account has been successfully created. You can now:" +
                "</p>" +
                "<ul style='margin: 20px 0; padding-left: 20px; color: #4b5563;'>" +
                "<li style='margin: 10px 0;'>Track and manage IT assets</li>" +
                "<li style='margin: 10px 0;'>Schedule maintenance</li>" +
                "<li style='margin: 10px 0;'>Generate reports</li>" +
                "<li style='margin: 10px 0;'>Set up integrations</li>" +
                "</ul>";

        return buildEmailTemplate(
                "Welcome to Krubles Asset Management",
                "Hi " + user.getFirstName() + ",",
                "Welcome to Krubles! We're excited to have you on board.",
                content,
                "Go to Dashboard",
                appUrl + "/app/dashboard"
        );
    }

    private String buildAssetDetailsHtml(Asset asset) {
        return "<div style='background: linear-gradient(135deg, #eff6ff 0%, #d1fae5 100%); border-radius: 12px; padding: 20px; margin: 20px 0;'>" +
                "<p style='margin: 8px 0; color: #1f2937;'><strong>Asset:</strong> " + asset.getName() + "</p>" +
                (asset.getAssetTag() != null ? "<p style='margin: 8px 0; color: #1f2937;'><strong>Tag:</strong> " + asset.getAssetTag() + "</p>" : "") +
                (asset.getSerialNumber() != null ? "<p style='margin: 8px 0; color: #1f2937;'><strong>Serial:</strong> " + asset.getSerialNumber() + "</p>" : "") +
                (asset.getLocation() != null ? "<p style='margin: 8px 0; color: #1f2937;'><strong>Location:</strong> " + asset.getLocation() + "</p>" : "") +
                "<p style='margin: 8px 0; color: #1f2937;'><strong>Status:</strong> " + asset.getStatus() + "</p>" +
                "</div>";
    }

    private String buildEmailTemplate(String title, String greeting, String intro, String content, String buttonText, String buttonUrl) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>" + title + "</title>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background-color: #f3f4f6;'>" +
                "<table role='presentation' style='width: 100%; border-collapse: collapse;'>" +
                "<tr><td style='padding: 40px 0;' align='center'>" +
                
                "<!-- Main Container -->" +
                "<table role='presentation' style='width: 600px; max-width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
                
                "<!-- Header with Gradient -->" +
                "<tr><td style='background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;'>" +
                "<h1 style='margin: 0; color: white; font-size: 28px; font-weight: bold;'>Krubles</h1>" +
                "<p style='margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;'>Asset Management</p>" +
                "</td></tr>" +
                
                "<!-- Content -->" +
                "<tr><td style='padding: 40px 30px;'>" +
                "<h2 style='margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: bold;'>" + title + "</h2>" +
                "<p style='margin: 0 0 15px 0; color: #1f2937; font-size: 16px;'>" + greeting + "</p>" +
                "<p style='margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;'>" + intro + "</p>" +
                content +
                
                "<!-- Button -->" +
                "<table role='presentation' style='margin: 30px 0;'>" +
                "<tr><td align='center'>" +
                "<a href='" + buttonUrl + "' style='display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;'>" + buttonText + "</a>" +
                "</td></tr></table>" +
                
                "</td></tr>" +
                
                "<!-- Footer -->" +
                "<tr><td style='padding: 30px; background: #f9fafb; text-align: center; border-radius: 0 0 16px 16px;'>" +
                "<p style='margin: 0 0 10px 0; color: #6b7280; font-size: 13px;'>This is an automated notification from Krubles Asset Management</p>" +
                "<p style='margin: 0; color: #9ca3af; font-size: 12px;'>If you have questions, contact <a href='mailto:support@krubles.com' style='color: #2563eb; text-decoration: none;'>support@krubles.com</a></p>" +
                "</td></tr>" +
                
                "</table>" +
                "</td></tr></table>" +
                "</body></html>";
    }

    public boolean isConfigured() {
        return emailEnabled;
    }
}
