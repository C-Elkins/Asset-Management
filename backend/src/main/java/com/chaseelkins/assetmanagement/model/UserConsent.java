package com.chaseelkins.assetmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entity representing user consent preferences for GDPR/CCPA compliance.
 * Tracks what data processing activities each user has consented to.
 */
@Entity
@Table(name = "user_consents", 
       indexes = {
           @Index(name = "idx_user_consents_user", columnList = "user_id"),
           @Index(name = "idx_user_consents_tenant", columnList = "tenant_id"),
           @Index(name = "idx_user_consents_user_tenant", columnList = "user_id, tenant_id")
       },
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_user_consents_user_tenant", columnNames = {"user_id", "tenant_id"})
       })
@EntityListeners(AuditingEntityListener.class)
public class UserConsent extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Consent for marketing emails and promotional communications
     */
    @Column(name = "marketing_emails", nullable = false)
    private boolean marketingEmails = false;

    /**
     * Consent for analytics and performance tracking
     */
    @Column(name = "analytics", nullable = false)
    private boolean analytics = false;

    /**
     * Consent for essential data processing (required for app functionality)
     * This is always true and cannot be disabled
     */
    @Column(name = "data_processing", nullable = false)
    private boolean dataProcessing = true;

    /**
     * Version of the consent form/privacy policy when consent was given
     */
    @NotBlank(message = "Consent version is required")
    @Size(max = 20, message = "Consent version cannot exceed 20 characters")
    @Column(name = "consent_version", nullable = false)
    private String consentVersion = "1.0";

    /**
     * IP address from which consent was given (for audit purposes)
     */
    @Size(max = 45, message = "IP address cannot exceed 45 characters")
    @Column(name = "consent_ip_address")
    private String consentIpAddress;

    /**
     * User agent string from which consent was given (for audit purposes)
     */
    @Size(max = 500, message = "User agent cannot exceed 500 characters")
    @Column(name = "consent_user_agent")
    private String consentUserAgent;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Default constructor
    public UserConsent() {}

    // Constructor with essential fields
    public UserConsent(Long userId, Long tenantId) {
        this.userId = userId;
        this.setTenantId(tenantId);
        this.dataProcessing = true; // Always required
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isMarketingEmails() {
        return marketingEmails;
    }

    public void setMarketingEmails(boolean marketingEmails) {
        this.marketingEmails = marketingEmails;
    }

    public boolean isAnalytics() {
        return analytics;
    }

    public void setAnalytics(boolean analytics) {
        this.analytics = analytics;
    }

    public boolean isDataProcessing() {
        return dataProcessing;
    }

    public void setDataProcessing(boolean dataProcessing) {
        // Data processing is always required for app functionality
        this.dataProcessing = true;
    }

    public String getConsentVersion() {
        return consentVersion;
    }

    public void setConsentVersion(String consentVersion) {
        this.consentVersion = consentVersion;
    }

    public String getConsentIpAddress() {
        return consentIpAddress;
    }

    public void setConsentIpAddress(String consentIpAddress) {
        this.consentIpAddress = consentIpAddress;
    }

    public String getConsentUserAgent() {
        return consentUserAgent;
    }

    public void setConsentUserAgent(String consentUserAgent) {
        this.consentUserAgent = consentUserAgent;
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
        return "UserConsent{" +
                "id=" + id +
                ", userId=" + userId +
                ", tenantId=" + getTenantId() +
                ", marketingEmails=" + marketingEmails +
                ", analytics=" + analytics +
                ", dataProcessing=" + dataProcessing +
                ", consentVersion='" + consentVersion + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserConsent)) return false;
        UserConsent that = (UserConsent) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
