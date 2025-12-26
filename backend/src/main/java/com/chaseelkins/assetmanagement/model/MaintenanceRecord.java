package com.chaseelkins.assetmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records", indexes = {
    @Index(name = "idx_maintenance_tenant", columnList = "tenant_id"),
    @Index(name = "idx_maintenance_asset", columnList = "asset_id")
})
@EntityListeners(AuditingEntityListener.class)
public class MaintenanceRecord extends TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Maintenance type is required")
    @Size(max = 100, message = "Maintenance type cannot exceed 100 characters")
    @Column(name = "maintenance_type", nullable = false)
    private String maintenanceType;
    
    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Maintenance date is required")
    @Column(name = "maintenance_date", nullable = false)
    private LocalDate maintenanceDate;
    
    @Column(name = "completed_date")
    private LocalDate completedDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenancePriority priority = MaintenancePriority.MEDIUM;
    
    @Size(max = 100, message = "Performed by cannot exceed 100 characters")
    @Column(name = "performed_by")
    private String performedBy;
    
    @Size(max = 100, message = "Vendor cannot exceed 100 characters")
    private String vendor;
    
    @Positive(message = "Cost must be positive")
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
    
    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;
    
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Size(max = 500, message = "Parts used cannot exceed 500 characters")
    @Column(name = "parts_used", columnDefinition = "TEXT")
    private String partsUsed;
    
    @Column(name = "downtime_hours")
    private Integer downtimeHours;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    @NotNull(message = "Asset is required")
    @JsonBackReference(value = "asset-maintenance")
    private Asset asset;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;
    
    // Constructors
    public MaintenanceRecord() {}
    
    public MaintenanceRecord(String maintenanceType, String description, LocalDate maintenanceDate,
                           LocalDate completedDate, MaintenanceStatus status, MaintenancePriority priority,
                           String performedBy, String vendor, BigDecimal cost, LocalDate nextMaintenanceDate,
                           String notes, String partsUsed, Integer downtimeHours, Asset asset, User createdBy) {
        this.maintenanceType = maintenanceType;
        this.description = description;
        this.maintenanceDate = maintenanceDate;
        this.completedDate = completedDate;
        this.status = status != null ? status : MaintenanceStatus.SCHEDULED;
        this.priority = priority != null ? priority : MaintenancePriority.MEDIUM;
        this.performedBy = performedBy;
        this.vendor = vendor;
        this.cost = cost;
        this.nextMaintenanceDate = nextMaintenanceDate;
        this.notes = notes;
        this.partsUsed = partsUsed;
        this.downtimeHours = downtimeHours;
        this.asset = asset;
        this.createdBy = createdBy;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMaintenanceType() {
        return maintenanceType;
    }
    
    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }
    
    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }
    
    public LocalDate getCompletedDate() {
        return completedDate;
    }
    
    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }
    
    public MaintenanceStatus getStatus() {
        return status;
    }
    
    public void setStatus(MaintenanceStatus status) {
        this.status = status;
    }
    
    public MaintenancePriority getPriority() {
        return priority;
    }
    
    public void setPriority(MaintenancePriority priority) {
        this.priority = priority;
    }
    
    public String getPerformedBy() {
        return performedBy;
    }
    
    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }
    
    public String getVendor() {
        return vendor;
    }
    
    public void setVendor(String vendor) {
        this.vendor = vendor;
    }
    
    public BigDecimal getCost() {
        return cost;
    }
    
    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }
    
    public LocalDate getNextMaintenanceDate() {
        return nextMaintenanceDate;
    }
    
    public void setNextMaintenanceDate(LocalDate nextMaintenanceDate) {
        this.nextMaintenanceDate = nextMaintenanceDate;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getPartsUsed() {
        return partsUsed;
    }
    
    public void setPartsUsed(String partsUsed) {
        this.partsUsed = partsUsed;
    }
    
    public Integer getDowntimeHours() {
        return downtimeHours;
    }
    
    public void setDowntimeHours(Integer downtimeHours) {
        this.downtimeHours = downtimeHours;
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
    
    public Asset getAsset() {
        return asset;
    }
    
    public void setAsset(Asset asset) {
        this.asset = asset;
    }
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    // Enums
    public enum MaintenanceStatus {
        SCHEDULED,      // Maintenance is scheduled
        IN_PROGRESS,    // Currently being worked on
        COMPLETED,      // Maintenance completed successfully
        CANCELLED,      // Maintenance was cancelled
        OVERDUE         // Scheduled maintenance is overdue
    }
    
    public enum MaintenancePriority {
        LOW,            // Routine maintenance
        MEDIUM,         // Standard maintenance
        HIGH,           // Important maintenance
        URGENT,         // Emergency maintenance
        CRITICAL        // Critical system failure
    }
    
    // Helper methods
    public boolean isCompleted() {
        return status == MaintenanceStatus.COMPLETED;
    }
    
    public boolean isOverdue() {
        return status == MaintenanceStatus.SCHEDULED && 
               maintenanceDate.isBefore(LocalDate.now());
    }
    
    public boolean isUpcoming() {
        return status == MaintenanceStatus.SCHEDULED && 
               maintenanceDate.isAfter(LocalDate.now()) &&
               maintenanceDate.isBefore(LocalDate.now().plusDays(7));
    }
    
    public String getStatusDisplay() {
        if (isOverdue()) {
            return "OVERDUE";
        }
        return status.toString();
    }
}
