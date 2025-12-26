package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.service.EnhancedExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

/**
 * Controller for enhanced export functionality with filtering and column selection.
 * Admin dashboard only - not visible on marketing pages.
 */
@RestController
@RequestMapping("/exports")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3006", "http://127.0.0.1:3006"})
public class ExportController {

    private final EnhancedExportService exportService;

    public ExportController(EnhancedExportService exportService) {
        this.exportService = exportService;
    }

    /**
     * Export assets with filters and custom column selection
     * 
     * Query Parameters:
     * - columns: Comma-separated list of columns to include (e.g., "name,assetTag,status")
     * - status: Filter by status (AVAILABLE, IN_USE, MAINTENANCE, RETIRED, DISPOSED)
     * - condition: Filter by condition (EXCELLENT, GOOD, FAIR, POOR, BROKEN)
     * - categoryId: Filter by category ID
     * - location: Filter by location (partial match)
     * - purchaseDateFrom: Filter by purchase date from (YYYY-MM-DD)
     * - purchaseDateTo: Filter by purchase date to (YYYY-MM-DD)
     * - warrantyExpiryFrom: Filter by warranty expiry from (YYYY-MM-DD)
     * - warrantyExpiryTo: Filter by warranty expiry to (YYYY-MM-DD)
     * - minPrice: Filter by minimum purchase price
     * - maxPrice: Filter by maximum purchase price
     */
    @GetMapping("/assets/csv")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN','IT_STAFF')")
    public void exportFilteredAssets(
            HttpServletResponse response,
            @RequestParam(required = false) Set<String> columns,
            @RequestParam(required = false) Asset.AssetStatus status,
            @RequestParam(required = false) Asset.AssetCondition condition,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate warrantyExpiryFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate warrantyExpiryTo,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) throws IOException {
        exportService.exportFilteredAssets(
            response, columns, status, condition, categoryId, location,
            purchaseDateFrom, purchaseDateTo, warrantyExpiryFrom, warrantyExpiryTo,
            minPrice, maxPrice
        );
    }

    /**
     * Get export statistics (preview before downloading)
     * Shows how many assets will be exported with current filters
     */
    @GetMapping("/assets/statistics")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN','IT_STAFF')")
    public ResponseEntity<EnhancedExportService.ExportStatistics> getExportStatistics(
            @RequestParam(required = false) Asset.AssetStatus status,
            @RequestParam(required = false) Asset.AssetCondition condition,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate warrantyExpiryFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate warrantyExpiryTo,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        EnhancedExportService.ExportStatistics stats = exportService.getExportStatistics(
            status, condition, categoryId, location,
            purchaseDateFrom, purchaseDateTo, warrantyExpiryFrom, warrantyExpiryTo,
            minPrice, maxPrice
        );
        return ResponseEntity.ok(stats);
    }
}
