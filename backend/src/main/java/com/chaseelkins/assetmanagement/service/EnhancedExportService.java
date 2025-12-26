package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Enhanced export service with filtering and column selection.
 * Admin dashboard functionality - not visible on marketing pages.
 */
@Service
public class EnhancedExportService {

    private static final Logger logger = LoggerFactory.getLogger(EnhancedExportService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    
    private final AssetRepository assetRepository;
    
    public EnhancedExportService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }
    
    /**
     * Export assets to CSV with filters and custom columns
     */
    public void exportFilteredAssets(
            HttpServletResponse response,
            Set<String> columns,
            Asset.AssetStatus status,
            Asset.AssetCondition condition,
            Long categoryId,
            String location,
            LocalDate purchaseDateFrom,
            LocalDate purchaseDateTo,
            LocalDate warrantyExpiryFrom,
            LocalDate warrantyExpiryTo,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) throws IOException {
        
        logger.info("Exporting filtered assets with {} columns", columns != null ? columns.size() : "all");
        
        // Get all assets and filter
        List<Asset> allAssets = assetRepository.findAll();
        List<Asset> filteredAssets = filterAssets(
            allAssets, status, condition, categoryId, location,
            purchaseDateFrom, purchaseDateTo, warrantyExpiryFrom, warrantyExpiryTo,
            minPrice, maxPrice
        );
        
        logger.info("Filtered {} assets from {} total", filteredAssets.size(), allAssets.size());
        
        // Determine which columns to include
        Set<String> selectedColumns = (columns == null || columns.isEmpty()) 
            ? getAllColumns() 
            : columns;
        
        // Set response headers
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"assets_export_" + 
            LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + ".csv\"");
        
        // Write CSV
        try (PrintWriter writer = response.getWriter()) {
            writeCSVHeader(writer, selectedColumns);
            writeCSVData(writer, filteredAssets, selectedColumns);
        }
        
        logger.info("Successfully exported {} assets", filteredAssets.size());
    }
    
    /**
     * Filter assets based on criteria
     */
    private List<Asset> filterAssets(
            List<Asset> assets,
            Asset.AssetStatus status,
            Asset.AssetCondition condition,
            Long categoryId,
            String location,
            LocalDate purchaseDateFrom,
            LocalDate purchaseDateTo,
            LocalDate warrantyExpiryFrom,
            LocalDate warrantyExpiryTo,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        return assets.stream()
            .filter(asset -> status == null || asset.getStatus() == status)
            .filter(asset -> condition == null || asset.getCondition() == condition)
            .filter(asset -> categoryId == null || 
                (asset.getCategory() != null && asset.getCategory().getId().equals(categoryId)))
            .filter(asset -> location == null || location.isEmpty() || 
                (asset.getLocation() != null && asset.getLocation().toLowerCase().contains(location.toLowerCase())))
            .filter(asset -> purchaseDateFrom == null || 
                (asset.getPurchaseDate() != null && !asset.getPurchaseDate().isBefore(purchaseDateFrom)))
            .filter(asset -> purchaseDateTo == null || 
                (asset.getPurchaseDate() != null && !asset.getPurchaseDate().isAfter(purchaseDateTo)))
            .filter(asset -> warrantyExpiryFrom == null || 
                (asset.getWarrantyExpiry() != null && !asset.getWarrantyExpiry().isBefore(warrantyExpiryFrom)))
            .filter(asset -> warrantyExpiryTo == null || 
                (asset.getWarrantyExpiry() != null && !asset.getWarrantyExpiry().isAfter(warrantyExpiryTo)))
            .filter(asset -> minPrice == null || 
                (asset.getPurchasePrice() != null && asset.getPurchasePrice().compareTo(minPrice) >= 0))
            .filter(asset -> maxPrice == null || 
                (asset.getPurchasePrice() != null && asset.getPurchasePrice().compareTo(maxPrice) <= 0))
            .collect(Collectors.toList());
    }
    
    /**
     * Get all available column names
     */
    private Set<String> getAllColumns() {
        return Set.of(
            "id", "name", "assetTag", "description", "brand", "model", "serialNumber",
            "purchasePrice", "purchaseDate", "vendor", "location", "status", "condition",
            "warrantyExpiry", "nextMaintenance", "notes", "category", "createdAt", "updatedAt"
        );
    }
    
    /**
     * Write CSV header row
     */
    private void writeCSVHeader(PrintWriter writer, Set<String> columns) {
        List<String> headerRow = new ArrayList<>();
        
        if (columns.contains("id")) headerRow.add("ID");
        if (columns.contains("name")) headerRow.add("Name");
        if (columns.contains("assetTag")) headerRow.add("Asset Tag");
        if (columns.contains("description")) headerRow.add("Description");
        if (columns.contains("brand")) headerRow.add("Brand");
        if (columns.contains("model")) headerRow.add("Model");
        if (columns.contains("serialNumber")) headerRow.add("Serial Number");
        if (columns.contains("purchasePrice")) headerRow.add("Purchase Price");
        if (columns.contains("purchaseDate")) headerRow.add("Purchase Date");
        if (columns.contains("vendor")) headerRow.add("Vendor");
        if (columns.contains("location")) headerRow.add("Location");
        if (columns.contains("status")) headerRow.add("Status");
        if (columns.contains("condition")) headerRow.add("Condition");
        if (columns.contains("warrantyExpiry")) headerRow.add("Warranty Expiry");
        if (columns.contains("nextMaintenance")) headerRow.add("Next Maintenance");
        if (columns.contains("notes")) headerRow.add("Notes");
        if (columns.contains("category")) headerRow.add("Category");
        if (columns.contains("createdAt")) headerRow.add("Created At");
        if (columns.contains("updatedAt")) headerRow.add("Updated At");
        
        writer.println(String.join(",", headerRow));
    }
    
    /**
     * Write CSV data rows
     */
    private void writeCSVData(PrintWriter writer, List<Asset> assets, Set<String> columns) {
        for (Asset asset : assets) {
            List<String> row = new ArrayList<>();
            
            if (columns.contains("id")) row.add(escapeCSV(String.valueOf(asset.getId())));
            if (columns.contains("name")) row.add(escapeCSV(asset.getName()));
            if (columns.contains("assetTag")) row.add(escapeCSV(asset.getAssetTag()));
            if (columns.contains("description")) row.add(escapeCSV(asset.getDescription()));
            if (columns.contains("brand")) row.add(escapeCSV(asset.getBrand()));
            if (columns.contains("model")) row.add(escapeCSV(asset.getModel()));
            if (columns.contains("serialNumber")) row.add(escapeCSV(asset.getSerialNumber()));
            if (columns.contains("purchasePrice")) row.add(escapeCSV(formatPrice(asset.getPurchasePrice())));
            if (columns.contains("purchaseDate")) row.add(escapeCSV(formatDate(asset.getPurchaseDate())));
            if (columns.contains("vendor")) row.add(escapeCSV(asset.getVendor()));
            if (columns.contains("location")) row.add(escapeCSV(asset.getLocation()));
            if (columns.contains("status")) row.add(escapeCSV(asset.getStatus() != null ? asset.getStatus().name() : ""));
            if (columns.contains("condition")) row.add(escapeCSV(asset.getCondition() != null ? asset.getCondition().name() : ""));
            if (columns.contains("warrantyExpiry")) row.add(escapeCSV(formatDate(asset.getWarrantyExpiry())));
            if (columns.contains("nextMaintenance")) row.add(escapeCSV(formatDate(asset.getNextMaintenance())));
            if (columns.contains("notes")) row.add(escapeCSV(asset.getNotes()));
            if (columns.contains("category")) row.add(escapeCSV(asset.getCategory() != null ? asset.getCategory().getName() : ""));
            if (columns.contains("createdAt")) row.add(escapeCSV(formatDate(asset.getCreatedAt().toLocalDate())));
            if (columns.contains("updatedAt")) row.add(escapeCSV(formatDate(asset.getUpdatedAt().toLocalDate())));
            
            writer.println(String.join(",", row));
        }
    }
    
    /**
     * Escape CSV values (handle commas, quotes, newlines)
     */
    private String escapeCSV(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        
        // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        
        return value;
    }
    
    /**
     * Format date for CSV
     */
    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "";
    }
    
    /**
     * Format price for CSV
     */
    private String formatPrice(BigDecimal price) {
        return price != null ? price.toString() : "";
    }
    
    /**
     * Get export statistics
     */
    public ExportStatistics getExportStatistics(
            Asset.AssetStatus status,
            Asset.AssetCondition condition,
            Long categoryId,
            String location,
            LocalDate purchaseDateFrom,
            LocalDate purchaseDateTo,
            LocalDate warrantyExpiryFrom,
            LocalDate warrantyExpiryTo,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        List<Asset> allAssets = assetRepository.findAll();
        List<Asset> filteredAssets = filterAssets(
            allAssets, status, condition, categoryId, location,
            purchaseDateFrom, purchaseDateTo, warrantyExpiryFrom, warrantyExpiryTo,
            minPrice, maxPrice
        );
        
        BigDecimal totalValue = filteredAssets.stream()
            .map(Asset::getPurchasePrice)
            .filter(price -> price != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new ExportStatistics(
            allAssets.size(),
            filteredAssets.size(),
            totalValue,
            getAllColumns()
        );
    }
    
    /**
     * Export statistics DTO
     */
    public static class ExportStatistics {
        private final int totalAssets;
        private final int filteredAssets;
        private final BigDecimal totalValue;
        private final Set<String> availableColumns;
        
        public ExportStatistics(int totalAssets, int filteredAssets, BigDecimal totalValue, Set<String> availableColumns) {
            this.totalAssets = totalAssets;
            this.filteredAssets = filteredAssets;
            this.totalValue = totalValue;
            this.availableColumns = availableColumns;
        }
        
        public int getTotalAssets() { return totalAssets; }
        public int getFilteredAssets() { return filteredAssets; }
        public BigDecimal getTotalValue() { return totalValue; }
        public Set<String> getAvailableColumns() { return availableColumns; }
    }
}
