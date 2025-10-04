package com.chaseelkins.assetmanagement.dto.imports;

import com.chaseelkins.assetmanagement.model.Asset;
import jakarta.validation.constraints.NotBlank;
// No additional validation annotations needed here beyond NotBlank

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class BulkImportRequests {
    public record CategoryItem(
            @NotBlank String name,
            String description,
            String colorCode,
            String icon,
            Boolean active,
            Integer sortOrder
    ) {}

    public record CategoriesRequest(List<CategoryItem> categories) {}

    public record AssetItem(
            @NotBlank String name,
            @NotBlank String assetTag,
            String description,
            String brand,
            String model,
            String serialNumber,
            BigDecimal purchasePrice,
            LocalDate purchaseDate,
            String vendor,
            String location,
            Asset.AssetStatus status,
            Asset.AssetCondition condition,
            LocalDate warrantyExpiry,
            LocalDate nextMaintenance,
            String notes,
            Long categoryId,
            String categoryName
    ) {}

    public record AssetsRequest(List<AssetItem> assets) {}
}
