package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.AssetDTO;
import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/assets")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class AssetController {
    
    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    /**
     * Get all assets with pagination
     */
    @GetMapping
    public ResponseEntity<Page<Asset>> getAllAssets(Pageable pageable) {
        Page<Asset> assets = assetService.getAllAssets(pageable);
        return ResponseEntity.ok(assets);
    }

    /**
     * Create a new asset
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Asset> createAsset(@Valid @RequestBody AssetDTO assetDTO) {
        Asset createdAsset = assetService.createAsset(assetDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAsset);
    }

    /**
     * Get asset by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        try {
            Asset asset = assetService.getAssetById(id);
            return ResponseEntity.ok(asset);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update asset
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetDTO assetDTO) {
        try {
            Asset updatedAsset = assetService.updateAsset(id, assetDTO);
            return ResponseEntity.ok(updatedAsset);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete asset (soft delete by retiring)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        try {
            assetService.deleteAsset(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Search assets
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Asset>> searchAssets(
            @RequestParam String query,
            Pageable pageable) {
        Page<Asset> assets = assetService.searchAssets(query, pageable);
        return ResponseEntity.ok(assets);
    }

    /**
     * Get assets by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<Asset>> getAssetsByStatus(
            @PathVariable Asset.AssetStatus status,
            Pageable pageable) {
        Page<Asset> assets = assetService.getAssetsByStatus(status, pageable);
        return ResponseEntity.ok(assets);
    }

    /**
     * Get assets by category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<Asset>> getAssetsByCategory(
            @PathVariable Long categoryId,
            Pageable pageable) {
        try {
            Page<Asset> assets = assetService.getAssetsByCategory(categoryId, pageable);
            return ResponseEntity.ok(assets);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Assign asset to user
     */
    @PostMapping("/{assetId}/assign/{userId}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Asset> assignAsset(@PathVariable Long assetId, @PathVariable Long userId) {
        try {
            Asset asset = assetService.assignAssetToUser(assetId, userId);
            return ResponseEntity.ok(asset);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Unassign asset from user
     */
    @PostMapping("/{assetId}/unassign/{userId}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Asset> unassignAsset(@PathVariable Long assetId, @PathVariable Long userId) {
        try {
            Asset asset = assetService.unassignAssetFromUser(assetId, userId);
            return ResponseEntity.ok(asset);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Change asset status
     */
    @PatchMapping("/{assetId}/status")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Asset> changeAssetStatus(
            @PathVariable Long assetId,
            @RequestParam Asset.AssetStatus status) {
        try {
            Asset asset = assetService.changeAssetStatus(assetId, status);
            return ResponseEntity.ok(asset);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get asset statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<AssetService.AssetStatistics> getAssetStatistics() {
        AssetService.AssetStatistics stats = assetService.getAssetStatistics();
        return ResponseEntity.ok(stats);
    }
}