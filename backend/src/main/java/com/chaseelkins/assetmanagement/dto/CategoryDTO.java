package com.chaseelkins.assetmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryDTO {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Size(max = 50, message = "Color code cannot exceed 50 characters")
    private String colorCode;

    @Size(max = 50, message = "Icon cannot exceed 50 characters")
    private String icon;

    private Boolean active;

    private Integer sortOrder;

    public CategoryDTO() {}

    public CategoryDTO(String name, String description, String colorCode, String icon, Boolean active, Integer sortOrder) {
        this.name = name;
        this.description = description;
        this.colorCode = colorCode;
        this.icon = icon;
        this.active = active;
        this.sortOrder = sortOrder;
    }

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
}
