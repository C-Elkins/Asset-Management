package com.chaseelkins.assetmanagement.dto;

import com.chaseelkins.assetmanagement.model.SubscriptionTier;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for tenant registration
 */
public class TenantRegistrationDTO {
    
    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Organization name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Subdomain is required")
    @Pattern(regexp = "^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$", 
             message = "Subdomain must be lowercase alphanumeric with hyphens, 3-63 characters")
    @Size(min = 3, max = 63, message = "Subdomain must be between 3 and 63 characters")
    private String subdomain;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    private String contactEmail;
    
    @Size(max = 100, message = "Contact name cannot exceed 100 characters")
    private String contactName;
    
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phoneNumber;
    
    private SubscriptionTier subscriptionTier;
    
    // Admin user for the tenant
    @NotBlank(message = "Admin username is required")
    @Size(min = 3, max = 50, message = "Admin username must be between 3 and 50 characters")
    private String adminUsername;
    
    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid admin email format")
    private String adminEmail;
    
    @NotBlank(message = "Admin password is required")
    @Size(min = 8, message = "Admin password must be at least 8 characters")
    private String adminPassword;
    
    @NotBlank(message = "Admin first name is required")
    private String adminFirstName;
    
    @NotBlank(message = "Admin last name is required")
    private String adminLastName;
    
    // Constructors
    public TenantRegistrationDTO() {}
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getSubdomain() {
        return subdomain;
    }
    
    public void setSubdomain(String subdomain) {
        this.subdomain = subdomain;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getContactEmail() {
        return contactEmail;
    }
    
    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
    
    public String getContactName() {
        return contactName;
    }
    
    public void setContactName(String contactName) {
        this.contactName = contactName;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public SubscriptionTier getSubscriptionTier() {
        return subscriptionTier;
    }
    
    public void setSubscriptionTier(SubscriptionTier subscriptionTier) {
        this.subscriptionTier = subscriptionTier;
    }
    
    public String getAdminUsername() {
        return adminUsername;
    }
    
    public void setAdminUsername(String adminUsername) {
        this.adminUsername = adminUsername;
    }
    
    public String getAdminEmail() {
        return adminEmail;
    }
    
    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }
    
    public String getAdminPassword() {
        return adminPassword;
    }
    
    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }
    
    public String getAdminFirstName() {
        return adminFirstName;
    }
    
    public void setAdminFirstName(String adminFirstName) {
        this.adminFirstName = adminFirstName;
    }
    
    public String getAdminLastName() {
        return adminLastName;
    }
    
    public void setAdminLastName(String adminLastName) {
        this.adminLastName = adminLastName;
    }
}
