package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.OAuth2UserInfo;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import com.chaseelkins.assetmanagement.security.CustomUserDetailsService;
import com.chaseelkins.assetmanagement.security.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service for handling OAuth2 authentication flows with external providers (Google, Microsoft, etc.)
 * Manages user creation/lookup and JWT token generation after successful OAuth2 authentication.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;
    
    @Value("${spring.security.oauth2.client.registration.microsoft.client-id:}")
    private String microsoftClientId;
    
    @Value("${spring.security.oauth2.client.registration.microsoft.client-secret:}")
    private String microsoftClientSecret;
    
    @Value("${spring.security.oauth2.client.registration.microsoft.tenant-id:common}")
    private String microsoftTenantId;
    
    /**
     * Processes Google OAuth2 authentication.
     * Verifies the Google ID token, extracts user information, and creates or updates the user.
     * 
     * @param idToken The Google ID token received from the frontend
     * @return Map containing JWT token and user information
     * @throws GeneralSecurityException if token verification fails
     * @throws IOException if there's an error communicating with Google
     */
    @Transactional
    public Map<String, Object> authenticateWithGoogle(String idToken) 
            throws GeneralSecurityException, IOException {
        log.info("Authenticating user with Google OAuth2");
        
        // Verify the Google ID token
        OAuth2UserInfo userInfo = verifyGoogleToken(idToken);
        
        if (userInfo == null) {
            throw new IllegalArgumentException("Invalid Google ID token");
        }
        
        // Find or create user
        User user = findOrCreateOAuth2User(userInfo);
        
        // Load UserDetails and generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String jwtToken = jwtTokenProvider.generateToken(userDetails);
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("user", createUserResponse(user));
        response.put("message", "Successfully authenticated with Google");
        
        log.info("User {} successfully authenticated with Google", user.getEmail());
        return response;
    }
    
    /**
     * Processes Microsoft OAuth2 authentication.
     * Verifies the Microsoft access token, extracts user information, and creates or updates the user.
     * 
     * @param accessToken The Microsoft access token received from the frontend
     * @return Map containing JWT token and user information
     */
    @Transactional
    public Map<String, Object> authenticateWithMicrosoft(String accessToken) {
        log.info("Authenticating user with Microsoft OAuth2");
        
        // Verify the Microsoft access token and get user info
        OAuth2UserInfo userInfo = verifyMicrosoftToken(accessToken);
        
        if (userInfo == null) {
            throw new IllegalArgumentException("Invalid Microsoft access token");
        }
        
        // Find or create user
        User user = findOrCreateOAuth2User(userInfo);
        
        // Load UserDetails and generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String jwtToken = jwtTokenProvider.generateToken(userDetails);
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("user", createUserResponse(user));
        response.put("message", "Successfully authenticated with Microsoft");
        
        log.info("User {} successfully authenticated with Microsoft", user.getEmail());
        return response;
    }
    
    /**
     * Verifies a Google ID token and extracts user information.
     * 
     * @param idTokenString The Google ID token to verify
     * @return OAuth2UserInfo containing user information, or null if verification fails
     */
    private OAuth2UserInfo verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
            
            GoogleIdToken idToken = verifier.verify(idTokenString);
            
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                
                OAuth2UserInfo userInfo = new OAuth2UserInfo();
                userInfo.setProviderId(payload.getSubject());
                userInfo.setEmail(payload.getEmail());
                userInfo.setEmailVerified(payload.getEmailVerified());
                userInfo.setFirstName((String) payload.get("given_name"));
                userInfo.setLastName((String) payload.get("family_name"));
                userInfo.setProfilePictureUrl((String) payload.get("picture"));
                userInfo.setAuthProvider(User.AuthProvider.GOOGLE);
                
                return userInfo;
            }
        } catch (Exception e) {
            log.error("Error verifying Google token: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Verifies a Microsoft access token and extracts user information.
     * Uses Microsoft Graph API to fetch the user's profile.
     * 
     * @param accessToken The Microsoft access token to verify
     * @return OAuth2UserInfo object with user data, or null if verification fails
     */
    private OAuth2UserInfo verifyMicrosoftToken(String accessToken) {
        try {
            log.debug("Verifying Microsoft access token");
            
            // Call Microsoft Graph API /me endpoint
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            String graphApiUrl = "https://graph.microsoft.com/v1.0/me";
            org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(
                    graphApiUrl,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode userNode = mapper.readTree(response.getBody());
                
                OAuth2UserInfo userInfo = new OAuth2UserInfo();
                userInfo.setProviderId(userNode.get("id").asText());
                userInfo.setEmail(userNode.has("mail") && !userNode.get("mail").isNull() 
                        ? userNode.get("mail").asText() 
                        : userNode.get("userPrincipalName").asText());
                userInfo.setEmailVerified(true); // Microsoft accounts are verified
                userInfo.setFirstName(userNode.has("givenName") ? userNode.get("givenName").asText() : null);
                userInfo.setLastName(userNode.has("surname") ? userNode.get("surname").asText() : null);
                userInfo.setAuthProvider(User.AuthProvider.MICROSOFT);
                
                return userInfo;
            }
        } catch (Exception e) {
            log.error("Error verifying Microsoft token: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Finds an existing OAuth2 user or creates a new one if not found.
     * 
     * @param userInfo User information from OAuth2 provider
     * @return The found or newly created User
     */
    @Transactional
    public User findOrCreateOAuth2User(OAuth2UserInfo userInfo) {
        // Try to find user by provider ID first
        Optional<User> existingUser = findUserByProviderId(userInfo);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update user information in case it changed
            updateUserFromOAuth2Info(user, userInfo);
            return userRepository.save(user);
        }
        
        // Try to find by email (user might have registered locally first)
        Optional<User> userByEmail = userRepository.findByEmail(userInfo.getEmail());
        
        if (userByEmail.isPresent()) {
            User user = userByEmail.get();
            // Link OAuth2 provider to existing account
            linkOAuth2Provider(user, userInfo);
            updateUserFromOAuth2Info(user, userInfo);
            log.info("Linked {} provider to existing user: {}", 
                    userInfo.getAuthProvider(), user.getEmail());
            return userRepository.save(user);
        }
        
        // Create new user
        return createNewOAuth2User(userInfo);
    }
    
    /**
     * Finds a user by their OAuth2 provider ID.
     */
    private Optional<User> findUserByProviderId(OAuth2UserInfo userInfo) {
        return switch (userInfo.getAuthProvider()) {
            case GOOGLE -> userRepository.findByGoogleId(userInfo.getProviderId());
            case MICROSOFT -> userRepository.findByMicrosoftId(userInfo.getProviderId());
            default -> Optional.empty();
        };
    }
    
    /**
     * Links an OAuth2 provider to an existing user account.
     */
    private void linkOAuth2Provider(User user, OAuth2UserInfo userInfo) {
        switch (userInfo.getAuthProvider()) {
            case GOOGLE -> user.setGoogleId(userInfo.getProviderId());
            case MICROSOFT -> user.setMicrosoftId(userInfo.getProviderId());
            case LOCAL -> {} // No action needed for LOCAL
        }
        
        // Update auth provider if user was LOCAL
        if (user.getAuthProvider() == User.AuthProvider.LOCAL) {
            user.setAuthProvider(userInfo.getAuthProvider());
        }
    }
    
    /**
     * Updates user information from OAuth2 provider data.
     */
    private void updateUserFromOAuth2Info(User user, OAuth2UserInfo userInfo) {
        // Update profile picture if available
        if (userInfo.getProfilePictureUrl() != null && !userInfo.getProfilePictureUrl().isEmpty()) {
            user.setProfilePictureUrl(userInfo.getProfilePictureUrl());
        }
        
        // Update name if not set or different
        if (userInfo.getFirstName() != null && !userInfo.getFirstName().equals(user.getFirstName())) {
            user.setFirstName(userInfo.getFirstName());
        }
        if (userInfo.getLastName() != null && !userInfo.getLastName().equals(user.getLastName())) {
            user.setLastName(userInfo.getLastName());
        }
    }
    
    /**
     * Creates a new user from OAuth2 provider information.
     */
    private User createNewOAuth2User(OAuth2UserInfo userInfo) {
        User user = new User();
        user.setEmail(userInfo.getEmail());
        user.setFirstName(userInfo.getFirstName());
        user.setLastName(userInfo.getLastName());
        user.setUsername(generateUniqueUsername(userInfo.generateUsername()));
        user.setAuthProvider(userInfo.getAuthProvider());
        user.setProfilePictureUrl(userInfo.getProfilePictureUrl());
        user.setRole(User.Role.USER);
        user.setActive(true);
        user.setMustChangePassword(false); // OAuth2 users don't need to change password
        
        // Set provider-specific ID
        switch (userInfo.getAuthProvider()) {
            case GOOGLE -> user.setGoogleId(userInfo.getProviderId());
            case MICROSOFT -> user.setMicrosoftId(userInfo.getProviderId());
            case LOCAL -> {} // No action needed for LOCAL
        }
        
        // OAuth2 users don't have local passwords
        user.setPassword(null);
        
        User savedUser = userRepository.save(user);
        log.info("Created new {} user: {}", userInfo.getAuthProvider(), savedUser.getEmail());
        
        // Send welcome email asynchronously
        try {
            emailService.sendWelcomeEmail(savedUser);
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", savedUser.getEmail(), e.getMessage());
        }
        
        return savedUser;
    }
    
    /**
     * Generates a unique username by appending numbers if username already exists.
     */
    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
    
    /**
     * Creates a user response map without sensitive information.
     */
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("fullName", user.getFullName());
        userMap.put("role", user.getRole().toString());
        userMap.put("department", user.getDepartment());
        userMap.put("jobTitle", user.getJobTitle());
        userMap.put("profilePictureUrl", user.getProfilePictureUrl());
        userMap.put("authProvider", user.getAuthProvider().toString());
        return userMap;
    }
}
