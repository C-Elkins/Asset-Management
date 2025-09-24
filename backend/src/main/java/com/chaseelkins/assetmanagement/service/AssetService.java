package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.AssetDTO;
import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.Category;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.repository.CategoryRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AssetService {
    
    private static final Logger log = LoggerFactory.getLogger(AssetService.class);
    
    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    
    public AssetService(AssetRepository assetRepository, CategoryRepository categoryRepository, UserRepository userRepository) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new asset
     */
    public Asset createAsset(AssetDTO assetDTO) {
        log.info("Creating new asset: {}", assetDTO.getName());
        
        // Validate unique asset tag
        if (assetRepository.existsByAssetTag(assetDTO.getAssetTag())) {
            throw new IllegalArgumentException("Asset tag already exists: " + assetDTO.getAssetTag());
        }
        
        // Validate category exists
        Category category = categoryRepository.findById(assetDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + assetDTO.getCategoryId()));
        
        // Create asset entity
        Asset asset = new Asset();
        asset.setName(assetDTO.getName());
        asset.setAssetTag(assetDTO.getAssetTag());
        asset.setDescription(assetDTO.getDescription());
        asset.setBrand(assetDTO.getBrand());
        asset.setModel(assetDTO.getModel());
        asset.setSerialNumber(assetDTO.getSerialNumber());
        asset.setPurchasePrice(assetDTO.getPurchasePrice());
        asset.setPurchaseDate(assetDTO.getPurchaseDate());
        asset.setVendor(assetDTO.getVendor());
        asset.setLocation(assetDTO.getLocation());
        asset.setStatus(assetDTO.getStatus() != null ? assetDTO.getStatus() : Asset.AssetStatus.AVAILABLE);
        asset.setCondition(assetDTO.getCondition() != null ? assetDTO.getCondition() : Asset.AssetCondition.GOOD);
        asset.setWarrantyExpiry(assetDTO.getWarrantyExpiry());
        asset.setNextMaintenance(assetDTO.getNextMaintenance());
        asset.setNotes(assetDTO.getNotes());
        asset.setCategory(category);
        
        Asset savedAsset = assetRepository.save(asset);
        log.info("Successfully created asset: {} with ID: {}", savedAsset.getAssetTag(), savedAsset.getId());
        
        return savedAsset;
    }
    
    /**
     * Update an existing asset
     */
    public Asset updateAsset(Long assetId, AssetDTO assetDTO) {
        log.info("Updating asset with ID: {}", assetId);
        
        Asset existingAsset = getAssetById(assetId);
        
        // Check if asset tag changed and is unique
        if (!existingAsset.getAssetTag().equals(assetDTO.getAssetTag()) && 
            assetRepository.existsByAssetTag(assetDTO.getAssetTag())) {
            throw new IllegalArgumentException("Asset tag already exists: " + assetDTO.getAssetTag());
        }
        
        // Validate category if changed
        if (!existingAsset.getCategory().getId().equals(assetDTO.getCategoryId())) {
            Category category = categoryRepository.findById(assetDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + assetDTO.getCategoryId()));
            existingAsset.setCategory(category);
        }
        
        // Update fields
        existingAsset.setName(assetDTO.getName());
        existingAsset.setAssetTag(assetDTO.getAssetTag());
        existingAsset.setDescription(assetDTO.getDescription());
        existingAsset.setBrand(assetDTO.getBrand());
        existingAsset.setModel(assetDTO.getModel());
        existingAsset.setSerialNumber(assetDTO.getSerialNumber());
        existingAsset.setPurchasePrice(assetDTO.getPurchasePrice());
        existingAsset.setPurchaseDate(assetDTO.getPurchaseDate());
        existingAsset.setVendor(assetDTO.getVendor());
        existingAsset.setLocation(assetDTO.getLocation());
        existingAsset.setCondition(assetDTO.getCondition());
        existingAsset.setWarrantyExpiry(assetDTO.getWarrantyExpiry());
        existingAsset.setNextMaintenance(assetDTO.getNextMaintenance());
        existingAsset.setNotes(assetDTO.getNotes());
        
        Asset updatedAsset = assetRepository.save(existingAsset);
        log.info("Successfully updated asset: {}", updatedAsset.getAssetTag());
        
        return updatedAsset;
    }
    
    /**
     * Get asset by ID
     */
    @Transactional(readOnly = true)
    public Asset getAssetById(Long assetId) {
        return assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found with ID: " + assetId));
    }
    
    /**
     * Get asset by asset tag
     */
    @Transactional(readOnly = true)
    public Optional<Asset> getAssetByTag(String assetTag) {
        return assetRepository.findByAssetTag(assetTag);
    }
    
    /**
     * Get all assets with pagination
     */
    @Transactional(readOnly = true)
    public Page<Asset> getAllAssets(Pageable pageable) {
        return assetRepository.findAll(pageable);
    }
    
    /**
     * Search assets
     */
    @Transactional(readOnly = true)
    public Page<Asset> searchAssets(String searchTerm, Pageable pageable) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllAssets(pageable);
        }
        return assetRepository.searchAssets(searchTerm.trim(), pageable);
    }
    
    /**
     * Get assets by status
     */
    @Transactional(readOnly = true)
    public Page<Asset> getAssetsByStatus(Asset.AssetStatus status, Pageable pageable) {
        return assetRepository.findByStatus(status, pageable);
    }
    
    /**
     * Get assets by category
     */
    @Transactional(readOnly = true)
    public Page<Asset> getAssetsByCategory(Long categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        return assetRepository.findByCategory(category, pageable);
    }
    
    /**
     * Get assets by location
     */
    @Transactional(readOnly = true)
    public Page<Asset> getAssetsByLocation(String location, Pageable pageable) {
        return assetRepository.findByLocation(location, pageable);
    }
    
    /**
     * Get available assets
     */
    @Transactional(readOnly = true)
    public List<Asset> getAvailableAssets() {
        return assetRepository.findAvailableAssets();
    }
    
    /**
     * Get assets assigned to user
     */
    @Transactional(readOnly = true)
    public List<Asset> getAssetsByUser(Long userId) {
        return assetRepository.findByAssignedUserId(userId);
    }
    
    /**
     * Assign asset to user
     */
    public Asset assignAssetToUser(Long assetId, Long userId) {
        log.info("Assigning asset {} to user {}", assetId, userId);
        
        Asset asset = getAssetById(assetId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Validate asset is available
        if (!asset.isAvailable()) {
            throw new IllegalStateException("Asset is not available for assignment: " + asset.getAssetTag());
        }
        
        // Add user to assigned users
        asset.getAssignedUsers().add(user);
        asset.setStatus(Asset.AssetStatus.ASSIGNED);
        
        Asset updatedAsset = assetRepository.save(asset);
        log.info("Successfully assigned asset {} to user {}", asset.getAssetTag(), user.getFullName());
        
        return updatedAsset;
    }
    
    /**
     * Unassign asset from user
     */
    public Asset unassignAssetFromUser(Long assetId, Long userId) {
        log.info("Unassigning asset {} from user {}", assetId, userId);
        
        Asset asset = getAssetById(assetId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Remove user from assigned users
        asset.getAssignedUsers().remove(user);
        
        // Update status if no users assigned
        if (asset.getAssignedUsers().isEmpty()) {
            asset.setStatus(Asset.AssetStatus.AVAILABLE);
        }
        
        Asset updatedAsset = assetRepository.save(asset);
        log.info("Successfully unassigned asset {} from user {}", asset.getAssetTag(), user.getFullName());
        
        return updatedAsset;
    }
    
    /**
     * Change asset status
     */
    public Asset changeAssetStatus(Long assetId, Asset.AssetStatus newStatus) {
        log.info("Changing asset {} status to {}", assetId, newStatus);
        
        Asset asset = getAssetById(assetId);
        Asset.AssetStatus oldStatus = asset.getStatus();
        
        // Validate status change
        validateStatusChange(asset, newStatus);
        
        asset.setStatus(newStatus);
        
        // Clear assignments if retiring or marking as lost/damaged
        if (newStatus == Asset.AssetStatus.RETIRED || 
            newStatus == Asset.AssetStatus.LOST || 
            newStatus == Asset.AssetStatus.DAMAGED) {
            asset.getAssignedUsers().clear();
        }
        
        Asset updatedAsset = assetRepository.save(asset);
        log.info("Successfully changed asset {} status from {} to {}", 
                 asset.getAssetTag(), oldStatus, newStatus);
        
        return updatedAsset;
    }
    
    /**
     * Get assets needing maintenance
     */
    @Transactional(readOnly = true)
    public List<Asset> getAssetsNeedingMaintenance() {
        return assetRepository.findAssetsNeedingMaintenance(LocalDate.now().plusDays(7));
    }
    
    /**
     * Get assets with expiring warranty
     */
    @Transactional(readOnly = true)
    public List<Asset> getAssetsWithExpiringWarranty(int daysAhead) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(daysAhead);
        return assetRepository.findAssetsWithExpiringWarranty(startDate, endDate);
    }
    
    /**
     * Get overdue maintenance assets
     */
    @Transactional(readOnly = true)
    public List<Asset> getOverdueMaintenanceAssets() {
        return assetRepository.findOverdueMaintenanceAssets();
    }
    
    /**
     * Filter assets by multiple criteria
     */
    @Transactional(readOnly = true)
    public Page<Asset> filterAssets(Asset.AssetStatus status, Long categoryId, 
                                    String location, Pageable pageable) {
        return assetRepository.findAssetsByCriteria(status, categoryId, location, pageable);
    }
    
    /**
     * Get asset statistics
     */
    @Transactional(readOnly = true)
    public AssetStatistics getAssetStatistics() {
        long totalAssets = assetRepository.count();
        long availableAssets = assetRepository.countByStatus(Asset.AssetStatus.AVAILABLE);
        long assignedAssets = assetRepository.countByStatus(Asset.AssetStatus.ASSIGNED);
        long maintenanceAssets = assetRepository.countByStatus(Asset.AssetStatus.IN_MAINTENANCE);
        long retiredAssets = assetRepository.countByStatus(Asset.AssetStatus.RETIRED);
        
        BigDecimal totalValue = assetRepository.findTotalAssetValue();
        BigDecimal averageValue = assetRepository.findAveragePurchasePrice();
        
        long assetsNeedingMaintenance = getAssetsNeedingMaintenance().size();
        long warrantyExpiring = getAssetsWithExpiringWarranty(30).size();
        
        return new AssetStatistics(totalAssets, availableAssets, assignedAssets, 
                                   maintenanceAssets, retiredAssets, totalValue, 
                                   averageValue, assetsNeedingMaintenance, warrantyExpiring);
    }
    
    /**
     * Get distinct locations
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctLocations() {
        return assetRepository.findDistinctLocations();
    }
    
    /**
     * Get distinct brands
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctBrands() {
        return assetRepository.findDistinctBrands();
    }
    
    /**
     * Get distinct vendors
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctVendors() {
        return assetRepository.findDistinctVendors();
    }
    
    /**
     * Delete asset (soft delete by retiring)
     */
    public void deleteAsset(Long assetId) {
        log.info("Soft deleting asset with ID: {}", assetId);
        changeAssetStatus(assetId, Asset.AssetStatus.RETIRED);
    }
    
    /**
     * Validate status change
     */
    private void validateStatusChange(Asset asset, Asset.AssetStatus newStatus) {
        Asset.AssetStatus currentStatus = asset.getStatus();
        
        // Business rules for status changes
        if (currentStatus == Asset.AssetStatus.RETIRED) {
            throw new IllegalStateException("Cannot change status of retired asset");
        }
        
        if (newStatus == Asset.AssetStatus.ASSIGNED && asset.getAssignedUsers().isEmpty()) {
            throw new IllegalStateException("Cannot mark asset as assigned without users");
        }
        
        if (newStatus == Asset.AssetStatus.AVAILABLE && !asset.getAssignedUsers().isEmpty()) {
            throw new IllegalStateException("Cannot mark asset as available while assigned to users");
        }
    }
    
    /**
     * Asset statistics inner class
     */
    public static class AssetStatistics {
        private final long totalAssets;
        private final long availableAssets;
        private final long assignedAssets;
        private final long maintenanceAssets;
        private final long retiredAssets;
        private final BigDecimal totalValue;
        private final BigDecimal averageValue;
        private final long assetsNeedingMaintenance;
        private final long warrantyExpiring;
        
        public AssetStatistics(long totalAssets, long availableAssets, long assignedAssets,
                               long maintenanceAssets, long retiredAssets, BigDecimal totalValue,
                               BigDecimal averageValue, long assetsNeedingMaintenance, long warrantyExpiring) {
            this.totalAssets = totalAssets;
            this.availableAssets = availableAssets;
            this.assignedAssets = assignedAssets;
            this.maintenanceAssets = maintenanceAssets;
            this.retiredAssets = retiredAssets;
            this.totalValue = totalValue != null ? totalValue : BigDecimal.ZERO;
            this.averageValue = averageValue != null ? averageValue : BigDecimal.ZERO;
            this.assetsNeedingMaintenance = assetsNeedingMaintenance;
            this.warrantyExpiring = warrantyExpiring;
        }
        
        // Getters
        public long getTotalAssets() { return totalAssets; }
        public long getAvailableAssets() { return availableAssets; }
        public long getAssignedAssets() { return assignedAssets; }
        public long getMaintenanceAssets() { return maintenanceAssets; }
        public long getRetiredAssets() { return retiredAssets; }
        public BigDecimal getTotalValue() { return totalValue; }
        public BigDecimal getAverageValue() { return averageValue; }
        public long getAssetsNeedingMaintenance() { return assetsNeedingMaintenance; }
        public long getWarrantyExpiring() { return warrantyExpiring; }
    }
}