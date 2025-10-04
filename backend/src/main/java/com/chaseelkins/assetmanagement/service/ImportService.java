package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.AssetDTO;
import com.chaseelkins.assetmanagement.dto.CategoryDTO;
import com.chaseelkins.assetmanagement.dto.imports.BulkImportRequests;
import com.chaseelkins.assetmanagement.dto.imports.BulkImportResponses;
import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.Category;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ImportService {

    private static final Logger log = LoggerFactory.getLogger(ImportService.class);

    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final CategoryService categoryService;
    private final AssetService assetService;

    public ImportService(CategoryRepository categoryRepository,
                         AssetRepository assetRepository,
                         CategoryService categoryService,
                         AssetService assetService) {
        this.categoryRepository = categoryRepository;
        this.assetRepository = assetRepository;
        this.categoryService = categoryService;
        this.assetService = assetService;
    }

    @Transactional
    public BulkImportResponses.Summary importCategories(BulkImportRequests.CategoriesRequest request) {
        BulkImportResponses.Summary summary = new BulkImportResponses.Summary();
        List<BulkImportRequests.CategoryItem> items = request.categories();
        if (items == null) return summary;
        summary.setReceived(items.size());
        for (int i = 0; i < items.size(); i++) {
            BulkImportRequests.CategoryItem it = items.get(i);
            try {
                Category existing = categoryRepository.findByNameIgnoreCase(it.name()).orElse(null);
                if (existing == null) {
                    // create
                    CategoryDTO dto = new CategoryDTO();
                    dto.setName(it.name());
                    dto.setDescription(it.description());
                    dto.setColorCode(it.colorCode());
                    dto.setIcon(it.icon());
                    dto.setActive(it.active());
                    dto.setSortOrder(it.sortOrder());
                    categoryService.createCategory(dto);
                    summary.setCreated(summary.getCreated() + 1);
                } else {
                    // update minimal fields
                    CategoryDTO dto = new CategoryDTO();
                    dto.setName(it.name());
                    dto.setDescription(it.description() != null ? it.description() : existing.getDescription());
                    dto.setColorCode(it.colorCode() != null ? it.colorCode() : existing.getColorCode());
                    dto.setIcon(it.icon() != null ? it.icon() : existing.getIcon());
                    dto.setActive(it.active() != null ? it.active() : existing.getActive());
                    dto.setSortOrder(it.sortOrder() != null ? it.sortOrder() : existing.getSortOrder());
                    categoryService.updateCategory(existing.getId(), dto);
                    summary.setUpdated(summary.getUpdated() + 1);
                }
            } catch (Exception e) {
                log.warn("Category import failed at index {}: {}", i, e.getMessage());
                summary.addError(i, e.getMessage());
            }
        }
        return summary;
    }

    @Transactional
    public BulkImportResponses.Summary importAssets(BulkImportRequests.AssetsRequest request) {
        BulkImportResponses.Summary summary = new BulkImportResponses.Summary();
        List<BulkImportRequests.AssetItem> items = request.assets();
        if (items == null) return summary;
        summary.setReceived(items.size());
        for (int i = 0; i < items.size(); i++) {
            BulkImportRequests.AssetItem it = items.get(i);
            try {
                // Resolve category
                Long categoryId = it.categoryId();
                if (categoryId == null && it.categoryName() != null && !it.categoryName().isBlank()) {
                    Category cat = categoryRepository.findByNameIgnoreCase(it.categoryName())
                            .orElseGet(() -> categoryService.createCategory(new CategoryDTO(it.categoryName(), null, null, null, true, null)));
                    categoryId = cat.getId();
                }
                if (categoryId == null) {
                    throw new IllegalArgumentException("categoryId or categoryName is required");
                }

                Asset existing = assetRepository.findByAssetTag(it.assetTag()).orElse(null);
                if (existing == null) {
                    // create via AssetService to reuse validation
                    AssetDTO dto = new AssetDTO(
                            it.name(), it.assetTag(), it.description(), it.brand(), it.model(), it.serialNumber(),
                            it.purchasePrice(), it.purchaseDate(), it.vendor(), it.location(), it.status(), it.condition(),
                            it.warrantyExpiry(), it.nextMaintenance(), it.notes(), categoryId
                    );
                    assetService.createAsset(dto);
                    summary.setCreated(summary.getCreated() + 1);
                } else {
                    // update selected fields via service
                    AssetDTO dto = AssetDTO.fromEntity(existing);
                    dto.setName(it.name() != null ? it.name() : dto.getName());
                    dto.setAssetTag(it.assetTag() != null ? it.assetTag() : dto.getAssetTag());
                    dto.setDescription(it.description() != null ? it.description() : dto.getDescription());
                    dto.setBrand(it.brand() != null ? it.brand() : dto.getBrand());
                    dto.setModel(it.model() != null ? it.model() : dto.getModel());
                    dto.setSerialNumber(it.serialNumber() != null ? it.serialNumber() : dto.getSerialNumber());
                    dto.setPurchasePrice(it.purchasePrice() != null ? it.purchasePrice() : dto.getPurchasePrice());
                    dto.setPurchaseDate(it.purchaseDate() != null ? it.purchaseDate() : dto.getPurchaseDate());
                    dto.setVendor(it.vendor() != null ? it.vendor() : dto.getVendor());
                    dto.setLocation(it.location() != null ? it.location() : dto.getLocation());
                    dto.setStatus(it.status() != null ? it.status() : dto.getStatus());
                    dto.setCondition(it.condition() != null ? it.condition() : dto.getCondition());
                    dto.setWarrantyExpiry(it.warrantyExpiry() != null ? it.warrantyExpiry() : dto.getWarrantyExpiry());
                    dto.setNextMaintenance(it.nextMaintenance() != null ? it.nextMaintenance() : dto.getNextMaintenance());
                    dto.setNotes(it.notes() != null ? it.notes() : dto.getNotes());
                    dto.setCategoryId(categoryId);
                    assetService.updateAsset(existing.getId(), dto);
                    summary.setUpdated(summary.getUpdated() + 1);
                }
            } catch (Exception e) {
                log.warn("Asset import failed at index {}: {}", i, e.getMessage());
                summary.addError(i, e.getMessage());
            }
        }
        return summary;
    }
}
