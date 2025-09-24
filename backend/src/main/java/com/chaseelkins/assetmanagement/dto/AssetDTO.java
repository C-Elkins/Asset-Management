package com.chaseelkins.assetmanagement.dto;

import com.chaseelkins.assetmanagement.model.Asset;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AssetDTO {
    
    @NotBlank(message = "Asset name is required")
    @Size(min = 2, max = 100, message = "Asset name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Asset tag is required")
    @Size(max = 50, message = "Asset tag cannot exceed 50 characters")
    private String assetTag;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;
    
    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;
    
    @Size(max = 100, message = "Serial number cannot exceed 100 characters")
    private String serialNumber;
    
    @Positive(message = "Purchase price must be positive")
    private BigDecimal purchasePrice;
    
    private LocalDate purchaseDate;
    
    @Size(max = 100, message = "Vendor cannot exceed 100 characters")
    private String vendor;
    
    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;
    
    private Asset.AssetStatus status;
    
    private Asset.AssetCondition condition;
    
    private LocalDate warrantyExpiry;
    
    private LocalDate nextMaintenance;
    
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    // Constructors
    public AssetDTO() {}
    
    public AssetDTO(String name, String assetTag, String description, String brand, String model, 
                    String serialNumber, BigDecimal purchasePrice, LocalDate purchaseDate, 
                    String vendor, String location, Asset.AssetStatus status, Asset.AssetCondition condition,
                    LocalDate warrantyExpiry, LocalDate nextMaintenance, String notes, Long categoryId) {
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
        this.status = status;
        this.condition = condition;
        this.warrantyExpiry = warrantyExpiry;
        this.nextMaintenance = nextMaintenance;
        this.notes = notes;
        this.categoryId = categoryId;
    }
    
    // Getters and Setters
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
    
    public Asset.AssetStatus getStatus() {
        return status;
    }
    
    public void setStatus(Asset.AssetStatus status) {
        this.status = status;
    }
    
    public Asset.AssetCondition getCondition() {
        return condition;
    }
    
    public void setCondition(Asset.AssetCondition condition) {
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
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    // Helper method to create DTO from entity
    public static AssetDTO fromEntity(Asset asset) {
        return new AssetDTO(
            asset.getName(),
            asset.getAssetTag(),
            asset.getDescription(),
            asset.getBrand(),
            asset.getModel(),
            asset.getSerialNumber(),
            asset.getPurchasePrice(),
            asset.getPurchaseDate(),
            asset.getVendor(),
            asset.getLocation(),
            asset.getStatus(),
            asset.getCondition(),
            asset.getWarrantyExpiry(),
            asset.getNextMaintenance(),
            asset.getNotes(),
            asset.getCategory() != null ? asset.getCategory().getId() : null
        );
    }
}