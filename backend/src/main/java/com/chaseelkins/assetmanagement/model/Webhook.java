package com.chaseelkins.assetmanagement.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "webhooks", indexes = {
    @Index(name = "idx_webhooks_tenant", columnList = "tenant_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
public class Webhook extends TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 512)
    private String url;
    
    @Column(nullable = false)
    private String secret; // For HMAC signature verification
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "webhook_events", joinColumns = @JoinColumn(name = "webhook_id"))
    @Column(name = "event")
    @Enumerated(EnumType.STRING)
    private Set<WebhookEvent> events = new HashSet<>();
    
    @Column(nullable = false)
    private boolean active = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;
    
    @Column(name = "last_triggered_at")
    private LocalDateTime lastTriggeredAt;
    
    @Column(name = "failure_count")
    private int failureCount = 0;
    
    @Column(name = "last_error")
    private String lastError;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum WebhookEvent {
        ASSET_CREATED("Asset Created", "Triggered when a new asset is created"),
        ASSET_UPDATED("Asset Updated", "Triggered when an asset is updated"),
        ASSET_DELETED("Asset Deleted", "Triggered when an asset is deleted"),
        ASSET_ASSIGNED("Asset Assigned", "Triggered when an asset is assigned to a user"),
        ASSET_UNASSIGNED("Asset Unassigned", "Triggered when an asset is unassigned"),
        MAINTENANCE_SCHEDULED("Maintenance Scheduled", "Triggered when maintenance is scheduled"),
        MAINTENANCE_COMPLETED("Maintenance Completed", "Triggered when maintenance is completed"),
        USER_CREATED("User Created", "Triggered when a new user is created"),
        USER_UPDATED("User Updated", "Triggered when a user is updated"),
        CATEGORY_CREATED("Category Created", "Triggered when a new category is created"),
        CATEGORY_UPDATED("Category Updated", "Triggered when a category is updated");
        
        private final String displayName;
        private final String description;
        
        WebhookEvent(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
