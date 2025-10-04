package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.service.TeamsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for Microsoft Teams integration management.
 * Admin-only functionality - not exposed on marketing pages.
 * Accessed through authenticated dashboard only.
 */
@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@Tag(name = "Microsoft Teams", description = "Microsoft Teams notifications integration")
public class TeamsController {

    private final TeamsService teamsService;

    public TeamsController(TeamsService teamsService) {
        this.teamsService = teamsService;
    }

    /**
     * Get Teams configuration status
     */
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get Teams configuration status", 
               description = "Check if Microsoft Teams notifications are configured and enabled")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(teamsService.getConfigurationStatus());
    }

    /**
     * Test Teams connection
     */
    @PostMapping("/test")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Test Teams connection", 
               description = "Send a test notification to verify Teams integration")
    public ResponseEntity<Map<String, Object>> testConnection() {
        boolean success = teamsService.testConnection();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success 
            ? "Successfully connected to Microsoft Teams! Check your channel for the test message."
            : "Failed to connect to Teams. Please check your webhook URL and try again.");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Send a custom test message to Teams
     */
    @PostMapping("/send-test-message")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Send custom test message", 
               description = "Send a custom message to Teams for testing")
    public ResponseEntity<Map<String, Object>> sendTestMessage(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Test Message");
        String message = request.getOrDefault("message", "This is a test message from Krubles Asset Management.");
        
        try {
            teamsService.sendCustomMessage(title, message);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test message sent successfully to Teams!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send test message: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Send asset notification
     */
    @PostMapping("/notify/asset")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Send asset notification", 
               description = "Send an asset-related notification to Teams")
    public ResponseEntity<Map<String, Object>> sendAssetNotification(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Asset Notification");
        String message = request.getOrDefault("message", "");
        String assetName = request.getOrDefault("assetName", "Unknown");
        String status = request.getOrDefault("status", "N/A");
        
        try {
            teamsService.sendAssetNotification(title, message, assetName, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Asset notification sent to Teams!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send notification: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
