package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.service.OAuth2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for OAuth2 authentication endpoints.
 * Handles Google and Microsoft OAuth2 authentication flows.
 */
@RestController
@RequestMapping("/api/v1/auth/oauth2")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "OAuth2 Authentication", description = "OAuth2 authentication with Google and Microsoft")
public class OAuth2Controller {
    
    private final OAuth2Service oauth2Service;
    
    /**
     * Authenticates a user with Google OAuth2.
     * The frontend should obtain a Google ID token and send it to this endpoint.
     * 
     * @param request Map containing the Google ID token
     * @return JWT token and user information
     */
    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google", 
               description = "Authenticate using Google OAuth2 ID token. Returns a JWT token for subsequent API calls.")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            
            if (idToken == null || idToken.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Google ID token is required"));
            }
            
            Map<String, Object> response = oauth2Service.authenticateWithGoogle(idToken);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid Google ID token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid Google ID token", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error authenticating with Google: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed", "message", e.getMessage()));
        }
    }
    
    /**
     * Authenticates a user with Microsoft/Azure AD OAuth2.
     * Expects a Microsoft access token in the request body.
     * 
     * @param request Map containing the Microsoft access token
     * @return JWT token and user information
     */
    @PostMapping("/microsoft")
    @Operation(summary = "Authenticate with Microsoft", 
               description = "Authenticate using Microsoft/Azure AD OAuth2 access token")
    public ResponseEntity<?> authenticateWithMicrosoft(@RequestBody Map<String, String> request) {
        try {
            String accessToken = request.get("accessToken");
            
            if (accessToken == null || accessToken.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing access token", "message", "Access token is required"));
            }
            
            Map<String, Object> response = oauth2Service.authenticateWithMicrosoft(accessToken);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid Microsoft access token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid Microsoft access token", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error authenticating with Microsoft: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed", "message", e.getMessage()));
        }
    }
    
    /**
     * Health check endpoint for OAuth2 configuration.
     * 
     * @return OAuth2 provider status
     */
    @GetMapping("/status")
    @Operation(summary = "Check OAuth2 status", 
               description = "Get OAuth2 configuration status for available providers")
    public ResponseEntity<Map<String, Object>> getOAuth2Status() {
        return ResponseEntity.ok(Map.of(
            "providers", Map.of(
                "google", Map.of(
                    "enabled", true,
                    "status", "available"
                ),
                "microsoft", Map.of(
                    "enabled", true,
                    "status", "available"
                )
            )
        ));
    }
}
