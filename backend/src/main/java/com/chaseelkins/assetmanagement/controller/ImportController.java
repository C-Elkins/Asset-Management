package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.imports.BulkImportRequests;
import com.chaseelkins.assetmanagement.dto.imports.BulkImportResponses;
import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.service.ExcelService;
import com.chaseelkins.assetmanagement.service.ImportService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/imports")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3006", "http://127.0.0.1:3006"})
public class ImportController {

    private final ImportService importService;
    private final ExcelService excelService;
    private final AssetRepository assetRepository;

    public ImportController(ImportService importService, ExcelService excelService, AssetRepository assetRepository) {
        this.importService = importService;
        this.excelService = excelService;
        this.assetRepository = assetRepository;
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<BulkImportResponses.Summary> importCategories(@Valid @RequestBody BulkImportRequests.CategoriesRequest request) {
        BulkImportResponses.Summary summary = importService.importCategories(request);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/assets")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<BulkImportResponses.Summary> importAssets(@Valid @RequestBody BulkImportRequests.AssetsRequest request) {
        BulkImportResponses.Summary summary = importService.importAssets(request);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/excel")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<BulkImportResponses.Summary> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }
            
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
                throw new IllegalArgumentException("Only .xlsx files are supported");
            }
            
            BulkImportRequests.AssetsRequest request = excelService.parseExcelFile(file);
            BulkImportResponses.Summary summary = importService.importAssets(request);
            return ResponseEntity.ok(summary);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage(), e);
        }
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN','IT_STAFF')")
    public void exportAssetsToExcel(HttpServletResponse response) {
        try {
            List<Asset> assets = assetRepository.findAll();
            excelService.exportAssetsToExcel(assets, response);
        } catch (IOException e) {
            throw new RuntimeException("Failed to export Excel file: " + e.getMessage(), e);
        }
    }
}
