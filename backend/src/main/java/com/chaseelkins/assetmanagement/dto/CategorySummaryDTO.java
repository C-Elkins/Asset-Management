package com.chaseelkins.assetmanagement.dto;

import com.chaseelkins.assetmanagement.model.Category;

import java.time.LocalDateTime;

/**
 * Simplified Category DTO without circular references for clean JSON serialization
 */
public class CategorySummaryDTO {
    private Long id;
    private String name;
    private String description;
    private String colorCode;
    private String icon;
    private Boolean active;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer assetCount;

    // Constructors
    public CategorySummaryDTO() {}

    public CategorySummaryDTO(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        this.colorCode = category.getColorCode();
        this.icon = category.getIcon();
        this.active = category.getActive();
        this.sortOrder = category.getSortOrder();
        this.createdAt = category.getCreatedAt();
        this.updatedAt = category.getUpdatedAt();
        this.assetCount = category.getAssetCount();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getAssetCount() { return assetCount; }
    public void setAssetCount(Integer assetCount) { this.assetCount = assetCount; }
}