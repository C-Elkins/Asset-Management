package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.service.SlackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for Slack integration management.
 * Admin-only functionality - not exposed on marketing pages.
 * Accessed through authenticated dashboard only.
 */
@RestController
@RequestMapping("/slack")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class SlackController {

    private final SlackService slackService;

    public SlackController(SlackService slackService) {
        this.slackService = slackService;
    }

    /**
     * Get Slack configuration status
     */
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(slackService.getConfigurationStatus());
    }

    /**
     * Test Slack connection
     */
    @PostMapping("/test")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> testConnection() {
        boolean success = slackService.testConnection();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success 
            ? "Successfully connected to Slack! Check your channel for the test message."
            : "Failed to connect to Slack. Please check your webhook URL and try again.");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Send a custom test message to Slack
     */
    @PostMapping("/send-test-message")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> sendTestMessage(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Test Message");
        String message = request.getOrDefault("message", "This is a test message from Krubles Asset Management.");
        
        try {
            slackService.sendCustomMessage(title, message);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test message sent successfully!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send test message: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
