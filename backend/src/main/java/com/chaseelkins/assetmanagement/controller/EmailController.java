package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for email notification management and testing.
 * Provides endpoints to test email configuration and send custom emails.
 */
@RestController
@RequestMapping("/emails")
@Tag(name = "Email Notifications", description = "Email notification management and testing")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Get email configuration status
     */
    @GetMapping("/status")
    @Operation(summary = "Get email configuration status", 
               description = "Check if email notifications are configured and enabled")
    public ResponseEntity<Map<String, Object>> getEmailStatus() {
        return ResponseEntity.ok(Map.of(
                "configured", emailService.isConfigured(),
                "enabled", emailService.isConfigured(),
                "message", emailService.isConfigured() 
                        ? "Email notifications are enabled" 
                        : "Email notifications are not configured. Set EMAIL_NOTIFICATIONS_ENABLED=true and configure SMTP settings."
        ));
    }

    /**
     * Send a test email (Admin only)
     */
    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send test email", 
               description = "Send a test email to verify SMTP configuration (Admin only)")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email address is required"));
        }

        if (!emailService.isConfigured()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email notifications are not configured"));
        }

        try {
            String subject = "Test Email from Krubles Asset Management";
            String body = buildTestEmailBody();
            emailService.sendCustomEmail(to, subject, body);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Test email sent successfully to " + to,
                    "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to send test email: " + e.getMessage(),
                            "status", "failed"
                    ));
        }
    }

    /**
     * Send a custom email (Admin only)
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send custom email", 
               description = "Send a custom email to specified recipient (Admin only)")
    public ResponseEntity<Map<String, String>> sendCustomEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        String subject = request.get("subject");
        String body = request.get("body");
        
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email address is required"));
        }
        
        if (subject == null || subject.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Subject is required"));
        }
        
        if (body == null || body.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Body is required"));
        }

        if (!emailService.isConfigured()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email notifications are not configured"));
        }

        try {
            emailService.sendCustomEmail(to, subject, body);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Email sent successfully to " + to,
                    "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to send email: " + e.getMessage(),
                            "status", "failed"
                    ));
        }
    }

    private String buildTestEmailBody() {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Test Email</title>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background-color: #f3f4f6;'>" +
                "<table role='presentation' style='width: 100%; border-collapse: collapse;'>" +
                "<tr><td style='padding: 40px 0;' align='center'>" +
                
                "<table role='presentation' style='width: 600px; max-width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
                
                "<tr><td style='background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;'>" +
                "<h1 style='margin: 0; color: white; font-size: 28px; font-weight: bold;'>Krubles</h1>" +
                "<p style='margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;'>Asset Management</p>" +
                "</td></tr>" +
                
                "<tr><td style='padding: 40px 30px;'>" +
                "<h2 style='margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: bold;'>✅ Email Configuration Test</h2>" +
                "<p style='margin: 0 0 15px 0; color: #1f2937; font-size: 16px;'>Success!</p>" +
                "<p style='margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;'>" +
                "Your email notifications are configured correctly. You're now ready to receive:</p>" +
                
                "<ul style='margin: 20px 0; padding-left: 20px; color: #4b5563;'>" +
                "<li style='margin: 10px 0;'>Asset assignment notifications</li>" +
                "<li style='margin: 10px 0;'>Maintenance reminders</li>" +
                "<li style='margin: 10px 0;'>Warranty expiration alerts</li>" +
                "<li style='margin: 10px 0;'>System updates</li>" +
                "</ul>" +
                
                "<div style='background: linear-gradient(135deg, #eff6ff 0%, #d1fae5 100%); border-radius: 12px; padding: 20px; margin: 20px 0;'>" +
                "<p style='margin: 0; color: #1f2937; font-size: 14px;'>💡 <strong>Tip:</strong> You can customize notification preferences in your account settings.</p>" +
                "</div>" +
                
                "</td></tr>" +
                
                "<tr><td style='padding: 30px; background: #f9fafb; text-align: center; border-radius: 0 0 16px 16px;'>" +
                "<p style='margin: 0 0 10px 0; color: #6b7280; font-size: 13px;'>This is a test email from Krubles Asset Management</p>" +
                "<p style='margin: 0; color: #9ca3af; font-size: 12px;'>Questions? Contact <a href='mailto:support@krubles.com' style='color: #2563eb; text-decoration: none;'>support@krubles.com</a></p>" +
                "</td></tr>" +
                
                "</table>" +
                "</td></tr></table>" +
                "</body></html>";
    }
}
