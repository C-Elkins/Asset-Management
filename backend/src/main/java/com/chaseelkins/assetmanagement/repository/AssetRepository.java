package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.Category;
import com.chaseelkins.assetmanagement.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    // Basic finder methods
    Optional<Asset> findByAssetTag(String assetTag);
    
    boolean existsByAssetTag(String assetTag);
    
    Optional<Asset> findBySerialNumber(String serialNumber);
    
    // Find by status
    List<Asset> findByStatus(Asset.AssetStatus status);
    
    Page<Asset> findByStatus(Asset.AssetStatus status, Pageable pageable);
    
    // Find by condition
    List<Asset> findByCondition(Asset.AssetCondition condition);
    
    Page<Asset> findByCondition(Asset.AssetCondition condition, Pageable pageable);
    
    // Find by category
    List<Asset> findByCategory(Category category);
    
    Page<Asset> findByCategory(Category category, Pageable pageable);
    
    List<Asset> findByCategoryId(Long categoryId);
    
    // Find by location
    List<Asset> findByLocation(String location);
    
    Page<Asset> findByLocation(String location, Pageable pageable);
    
    // Find by assigned user
    @Query("SELECT a FROM Asset a JOIN a.assignedUsers u WHERE u.id = :userId")
    List<Asset> findByAssignedUserId(@Param("userId") Long userId);
    
    @Query("SELECT a FROM Asset a JOIN a.assignedUsers u WHERE u = :user")
    List<Asset> findByAssignedUser(@Param("user") User user);
    
    // Search assets
    @Query("SELECT a FROM Asset a WHERE " +
           "LOWER(a.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.brand) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.model) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Asset> searchAssets(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find available assets
    @Query("SELECT a FROM Asset a WHERE a.status = 'AVAILABLE'")
    List<Asset> findAvailableAssets();
    
    @Query("SELECT a FROM Asset a WHERE a.status = 'AVAILABLE'")
    Page<Asset> findAvailableAssetsPaginated(Pageable pageable);
    
    // Find assets needing maintenance
    @Query("SELECT a FROM Asset a WHERE a.nextMaintenance <= :date AND a.status != 'RETIRED'")
    List<Asset> findAssetsNeedingMaintenance(@Param("date") LocalDate date);
    
    // Find assets with warranty expiring soon
    @Query("SELECT a FROM Asset a WHERE a.warrantyExpiry BETWEEN :startDate AND :endDate AND a.status != 'RETIRED'")
    List<Asset> findAssetsWithExpiringWarranty(@Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
    
    // Find assets by purchase date range
    List<Asset> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find assets by price range
    List<Asset> findByPurchasePriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Find assets by brand
    List<Asset> findByBrandIgnoreCase(String brand);
    
    // Find assets by vendor
    List<Asset> findByVendorIgnoreCase(String vendor);
    
    // Count assets by status
    long countByStatus(Asset.AssetStatus status);
    
    // Count assets by category
    long countByCategory(Category category);
    
    long countByCategoryId(Long categoryId);
    
    // Count assets by condition
    long countByCondition(Asset.AssetCondition condition);
    
    // Find recently added assets
    @Query("SELECT a FROM Asset a WHERE a.createdAt >= :date ORDER BY a.createdAt DESC")
    List<Asset> findRecentlyAddedAssets(@Param("date") LocalDate date);
    
    // Find assets without assignments
    @Query("SELECT a FROM Asset a WHERE a.assignedUsers IS EMPTY AND a.status = 'AVAILABLE'")
    List<Asset> findUnassignedAssets();
    
    // Find overdue maintenance assets
    @Query("SELECT a FROM Asset a WHERE a.nextMaintenance < CURRENT_DATE AND a.status != 'RETIRED'")
    List<Asset> findOverdueMaintenanceAssets();
    
    // Statistical queries
    @Query("SELECT AVG(a.purchasePrice) FROM Asset a WHERE a.purchasePrice IS NOT NULL")
    BigDecimal findAveragePurchasePrice();
    
    @Query("SELECT SUM(a.purchasePrice) FROM Asset a WHERE a.purchasePrice IS NOT NULL")
    BigDecimal findTotalAssetValue();
    
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.createdAt >= :date")
    long countAssetsAddedSince(@Param("date") LocalDate date);
    
    // Find assets by multiple criteria
    @Query("SELECT a FROM Asset a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:categoryId IS NULL OR a.category.id = :categoryId) AND " +
           "(:location IS NULL OR LOWER(a.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<Asset> findAssetsByCriteria(@Param("status") Asset.AssetStatus status,
                                     @Param("categoryId") Long categoryId,
                                     @Param("location") String location,
                                     Pageable pageable);
    
    // Find distinct locations
    @Query("SELECT DISTINCT a.location FROM Asset a WHERE a.location IS NOT NULL ORDER BY a.location")
    List<String> findDistinctLocations();
    
    // Find distinct brands
    @Query("SELECT DISTINCT a.brand FROM Asset a WHERE a.brand IS NOT NULL ORDER BY a.brand")
    List<String> findDistinctBrands();
    
    // Find distinct vendors
    @Query("SELECT DISTINCT a.vendor FROM Asset a WHERE a.vendor IS NOT NULL ORDER BY a.vendor")
    List<String> findDistinctVendors();
}