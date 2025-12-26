package com.chaseelkins.assetmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Lightweight health check endpoint for quick frontend connectivity checks
 * This is simpler than Spring Actuator's /health endpoint and doesn't check external dependencies
 */
@RestController
public class HealthController {

    /**
     * Simple health check endpoint
     * Returns 200 OK if the application is running
     * Frontend uses this for quick connectivity tests without overhead of full health checks
     */
    @GetMapping("/healthz")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "IT Asset Management API");
        return ResponseEntity.ok(response);
    }
}
