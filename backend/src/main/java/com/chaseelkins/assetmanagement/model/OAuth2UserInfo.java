package com.chaseelkins.assetmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for OAuth2 user information from external providers (Google, Microsoft, etc.)
 * Contains the essential user information obtained after successful OAuth2 authentication.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2UserInfo {
    
    /**
     * Provider-specific unique identifier (e.g., Google ID, Microsoft Azure AD ID)
     */
    private String providerId;
    
    /**
     * User's email address (verified by the OAuth2 provider)
     */
    private String email;
    
    /**
     * User's first name
     */
    private String firstName;
    
    /**
     * User's last name
     */
    private String lastName;
    
    /**
     * URL to user's profile picture (optional)
     */
    private String profilePictureUrl;
    
    /**
     * The authentication provider (GOOGLE, MICROSOFT, etc.)
     */
    private User.AuthProvider authProvider;
    
    /**
     * Whether the email is verified by the provider
     */
    private boolean emailVerified;
    
    /**
     * Returns the full name of the user
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    /**
     * Generates a username from the email (part before @)
     */
    public String generateUsername() {
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf("@")).toLowerCase();
        }
        return email != null ? email.toLowerCase() : "user";
    }
}
