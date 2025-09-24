package com.chaseelkins.assetmanagement.dto;

import com.chaseelkins.assetmanagement.model.MaintenanceRecord;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MaintenanceRecordDTO {

    @NotBlank(message = "Maintenance type is required")
    @Size(max = 100, message = "Maintenance type cannot exceed 100 characters")
    private String maintenanceType;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Maintenance date is required")
    private LocalDate maintenanceDate;

    private LocalDate completedDate;

    private MaintenanceRecord.MaintenanceStatus status;

    private MaintenanceRecord.MaintenancePriority priority;

    @Size(max = 100, message = "Performed by cannot exceed 100 characters")
    private String performedBy;

    @Size(max = 100, message = "Vendor cannot exceed 100 characters")
    private String vendor;

    @Positive(message = "Cost must be positive")
    private BigDecimal cost;

    private LocalDate nextMaintenanceDate;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @Size(max = 500, message = "Parts used cannot exceed 500 characters")
    private String partsUsed;

    private Integer downtimeHours;

    @NotNull(message = "Asset is required")
    private Long assetId;

    private Long createdByUserId;

    public MaintenanceRecordDTO() {}

    // Getters and setters
    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getMaintenanceDate() { return maintenanceDate; }
    public void setMaintenanceDate(LocalDate maintenanceDate) { this.maintenanceDate = maintenanceDate; }
    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
    public MaintenanceRecord.MaintenanceStatus getStatus() { return status; }
    public void setStatus(MaintenanceRecord.MaintenanceStatus status) { this.status = status; }
    public MaintenanceRecord.MaintenancePriority getPriority() { return priority; }
    public void setPriority(MaintenanceRecord.MaintenancePriority priority) { this.priority = priority; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public String getVendor() { return vendor; }
    public void setVendor(String vendor) { this.vendor = vendor; }
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }
    public LocalDate getNextMaintenanceDate() { return nextMaintenanceDate; }
    public void setNextMaintenanceDate(LocalDate nextMaintenanceDate) { this.nextMaintenanceDate = nextMaintenanceDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPartsUsed() { return partsUsed; }
    public void setPartsUsed(String partsUsed) { this.partsUsed = partsUsed; }
    public Integer getDowntimeHours() { return downtimeHours; }
    public void setDowntimeHours(Integer downtimeHours) { this.downtimeHours = downtimeHours; }
    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }
}
