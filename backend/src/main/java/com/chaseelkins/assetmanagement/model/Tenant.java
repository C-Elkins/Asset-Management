package com.chaseelkins.assetmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Tenant entity for multi-tenant SaaS architecture.
 * Each tenant represents an isolated organization with complete data segregation.
 */
@Entity
@Table(name = "tenants", indexes = {
    @Index(name = "idx_tenant_subdomain", columnList = "subdomain", unique = true),
    @Index(name = "idx_tenant_active", columnList = "active"),
    @Index(name = "idx_tenant_created", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
public class Tenant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Tenant name is required")
    @Size(min = 2, max = 100, message = "Tenant name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Subdomain is required")
    @Pattern(regexp = "^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$", 
             message = "Subdomain must be lowercase alphanumeric with hyphens, 3-63 characters")
    @Size(min = 3, max = 63, message = "Subdomain must be between 3 and 63 characters")
    @Column(unique = true, nullable = false, length = 63)
    private String subdomain;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotBlank(message = "Contact email is required")
    @Column(name = "contact_email", nullable = false)
    private String contactEmail;
    
    @Size(max = 100, message = "Contact name cannot exceed 100 characters")
    @Column(name = "contact_name")
    private String contactName;
    
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier", nullable = false)
    private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;
    
    @Column(name = "max_users")
    private Integer maxUsers = 5; // Default for FREE tier
    
    @Column(name = "max_assets")
    private Integer maxAssets = 100; // Default for FREE tier
    
    @Column(name = "subscription_start_date")
    private LocalDateTime subscriptionStartDate;
    
    @Column(name = "subscription_end_date")
    private LocalDateTime subscriptionEndDate;
    
    @Size(max = 255, message = "Logo URL cannot exceed 255 characters")
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Size(max = 50, message = "Primary color cannot exceed 50 characters")
    @Column(name = "primary_color")
    private String primaryColor = "#6366f1"; // Default indigo
    
    @Column(name = "custom_domain")
    private String customDomain;
    
    @Column(name = "stripe_customer_id", unique = true)
    private String stripeCustomerId;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Tenant() {}
    
    public Tenant(String name, String subdomain, String contactEmail) {
        this.name = name;
        this.subdomain = subdomain.toLowerCase();
        this.contactEmail = contactEmail;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
        this.subdomain = subdomain != null ? subdomain.toLowerCase() : null;
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
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public SubscriptionTier getSubscriptionTier() {
        return subscriptionTier;
    }
    
    public void setSubscriptionTier(SubscriptionTier subscriptionTier) {
        this.subscriptionTier = subscriptionTier;
    }
    
    public Integer getMaxUsers() {
        return maxUsers;
    }
    
    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }
    
    public Integer getMaxAssets() {
        return maxAssets;
    }
    
    public void setMaxAssets(Integer maxAssets) {
        this.maxAssets = maxAssets;
    }
    
    public LocalDateTime getSubscriptionStartDate() {
        return subscriptionStartDate;
    }
    
    public void setSubscriptionStartDate(LocalDateTime subscriptionStartDate) {
        this.subscriptionStartDate = subscriptionStartDate;
    }
    
    public LocalDateTime getSubscriptionEndDate() {
        return subscriptionEndDate;
    }
    
    public void setSubscriptionEndDate(LocalDateTime subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
    }
    
    public String getLogoUrl() {
        return logoUrl;
    }
    
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    
    public String getPrimaryColor() {
        return primaryColor;
    }
    
    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }
    
    public String getCustomDomain() {
        return customDomain;
    }
    
    public void setCustomDomain(String customDomain) {
        this.customDomain = customDomain;
    }
    
    public String getStripeCustomerId() {
        return stripeCustomerId;
    }
    
    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "Tenant{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", subdomain='" + subdomain + '\'' +
                ", active=" + active +
                ", subscriptionTier=" + subscriptionTier +
                '}';
    }
}
