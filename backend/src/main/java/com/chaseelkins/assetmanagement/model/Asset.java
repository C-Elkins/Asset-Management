package com.chaseelkins.assetmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "assets", indexes = {
    @Index(name = "idx_assets_tenant", columnList = "tenant_id"),
    @Index(name = "idx_assets_asset_tag", columnList = "asset_tag"),
    @Index(name = "idx_assets_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
public class Asset extends TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Asset name is required")
    @Size(min = 2, max = 100, message = "Asset name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Asset tag is required")
    @Size(max = 50, message = "Asset tag cannot exceed 50 characters")
    @Column(name = "asset_tag", unique = true, nullable = false)
    private String assetTag;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;
    
    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;
    
    @Size(max = 100, message = "Serial number cannot exceed 100 characters")
    @Column(name = "serial_number")
    private String serialNumber;
    
    @Positive(message = "Purchase price must be positive")
    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;
    
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;
    
    @Size(max = 100, message = "Vendor cannot exceed 100 characters")
    private String vendor;
    
    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status = AssetStatus.AVAILABLE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "condition_rating", nullable = false)
    private AssetCondition condition = AssetCondition.GOOD;
    
    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;
    
    @Column(name = "next_maintenance")
    private LocalDate nextMaintenance;
    
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Category is required")
    @JsonBackReference
    private Category category;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "asset_assignments",
        joinColumns = @JoinColumn(name = "asset_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonManagedReference(value = "asset-assignment")
    private Set<User> assignedUsers = new HashSet<>();
    
    @OneToMany(mappedBy = "asset", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonManagedReference(value = "asset-maintenance")
    private Set<MaintenanceRecord> maintenanceRecords = new HashSet<>();
    
    // Constructors
    public Asset() {}
    
    public Asset(String name, String assetTag, String description, String brand, String model,
                 String serialNumber, BigDecimal purchasePrice, LocalDate purchaseDate,
                 String vendor, String location, AssetStatus status, AssetCondition condition,
                 LocalDate warrantyExpiry, LocalDate nextMaintenance, String notes, Category category) {
        this.name = name;
        this.assetTag = assetTag;
        this.description = description;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.purchasePrice = purchasePrice;
        this.purchaseDate = purchaseDate;
        this.vendor = vendor;
        this.location = location;
        this.status = status != null ? status : AssetStatus.AVAILABLE;
        this.condition = condition != null ? condition : AssetCondition.GOOD;
        this.warrantyExpiry = warrantyExpiry;
        this.nextMaintenance = nextMaintenance;
        this.notes = notes;
        this.category = category;
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
    
    public String getAssetTag() {
        return assetTag;
    }
    
    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getBrand() {
        return brand;
    }
    
    public void setBrand(String brand) {
        this.brand = brand;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
    }
    
    public String getSerialNumber() {
        return serialNumber;
    }
    
    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }
    
    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }
    
    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }
    
    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }
    
    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
    
    public String getVendor() {
        return vendor;
    }
    
    public void setVendor(String vendor) {
        this.vendor = vendor;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public AssetStatus getStatus() {
        return status;
    }
    
    public void setStatus(AssetStatus status) {
        this.status = status;
    }
    
    public AssetCondition getCondition() {
        return condition;
    }
    
    public void setCondition(AssetCondition condition) {
        this.condition = condition;
    }
    
    public LocalDate getWarrantyExpiry() {
        return warrantyExpiry;
    }
    
    public void setWarrantyExpiry(LocalDate warrantyExpiry) {
        this.warrantyExpiry = warrantyExpiry;
    }
    
    public LocalDate getNextMaintenance() {
        return nextMaintenance;
    }
    
    public void setNextMaintenance(LocalDate nextMaintenance) {
        this.nextMaintenance = nextMaintenance;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public Set<User> getAssignedUsers() {
        return assignedUsers;
    }
    
    public void setAssignedUsers(Set<User> assignedUsers) {
        this.assignedUsers = assignedUsers;
    }
    
    public Set<MaintenanceRecord> getMaintenanceRecords() {
        return maintenanceRecords;
    }
    
    public void setMaintenanceRecords(Set<MaintenanceRecord> maintenanceRecords) {
        this.maintenanceRecords = maintenanceRecords;
    }
    
    // Enums
    public enum AssetStatus {
        AVAILABLE,      // Available for assignment
        ASSIGNED,       // Currently assigned to user(s)
        IN_MAINTENANCE, // Under maintenance
        RETIRED,        // No longer in use
        LOST,           // Lost or stolen
        DAMAGED         // Damaged beyond repair
    }
    
    public enum AssetCondition {
        EXCELLENT,      // Like new
        GOOD,           // Minor wear
        FAIR,           // Noticeable wear but functional
        POOR,           // Significant wear, may need repair
        BROKEN          // Not functional
    }
    
    // Helper methods
    public boolean isAvailable() {
        return status == AssetStatus.AVAILABLE;
    }
    
    public boolean isAssigned() {
        return status == AssetStatus.ASSIGNED && !assignedUsers.isEmpty();
    }
    
    public boolean needsMaintenance() {
        return nextMaintenance != null && nextMaintenance.isBefore(LocalDate.now().plusDays(7));
    }
    
    public boolean isWarrantyExpiring() {
        return warrantyExpiry != null && warrantyExpiry.isBefore(LocalDate.now().plusDays(30));
    }
    
    public String getDisplayName() {
        return name + " (" + assetTag + ")";
    }
}
