package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.MaintenanceRecord;
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

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRecord, Long> {
    
    // Find by asset
    List<MaintenanceRecord> findByAsset(Asset asset);
    
    Page<MaintenanceRecord> findByAsset(Asset asset, Pageable pageable);
    
    List<MaintenanceRecord> findByAssetId(Long assetId);
    
    // Find by status
    List<MaintenanceRecord> findByStatus(MaintenanceRecord.MaintenanceStatus status);
    
    Page<MaintenanceRecord> findByStatus(MaintenanceRecord.MaintenanceStatus status, Pageable pageable);
    
    // Find by priority
    List<MaintenanceRecord> findByPriority(MaintenanceRecord.MaintenancePriority priority);
    
    Page<MaintenanceRecord> findByPriority(MaintenanceRecord.MaintenancePriority priority, Pageable pageable);
    
    // Find by maintenance date range
    List<MaintenanceRecord> findByMaintenanceDateBetween(LocalDate startDate, LocalDate endDate);
    
    Page<MaintenanceRecord> findByMaintenanceDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Find by created user
    List<MaintenanceRecord> findByCreatedBy(User createdBy);
    
    Page<MaintenanceRecord> findByCreatedBy(User createdBy, Pageable pageable);
    
    // Find overdue maintenance
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.status = 'SCHEDULED' AND m.maintenanceDate < CURRENT_DATE")
    List<MaintenanceRecord> findOverdueMaintenanceRecords();
    
    // Find upcoming maintenance (next 7 days)
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.status = 'SCHEDULED' " +
           "AND m.maintenanceDate BETWEEN CURRENT_DATE AND :endDate")
    List<MaintenanceRecord> findUpcomingMaintenanceRecords(@Param("endDate") LocalDate endDate);
    
    // Find today's maintenance
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.status IN ('SCHEDULED', 'IN_PROGRESS') " +
           "AND m.maintenanceDate = CURRENT_DATE")
    List<MaintenanceRecord> findTodaysMaintenanceRecords();
    
    // Find by maintenance type
    List<MaintenanceRecord> findByMaintenanceTypeIgnoreCase(String maintenanceType);
    
    // Find by vendor
    List<MaintenanceRecord> findByVendorIgnoreCase(String vendor);
    
    // Find by performed by
    List<MaintenanceRecord> findByPerformedByIgnoreCase(String performedBy);
    
    // Find completed maintenance in date range
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.status = 'COMPLETED' " +
           "AND m.completedDate BETWEEN :startDate AND :endDate")
    List<MaintenanceRecord> findCompletedMaintenanceBetween(@Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);
    
    // Search maintenance records
    @Query("SELECT m FROM MaintenanceRecord m WHERE " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.maintenanceType) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.performedBy) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.vendor) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<MaintenanceRecord> searchMaintenanceRecords(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Count by status
    long countByStatus(MaintenanceRecord.MaintenanceStatus status);
    
    // Count by priority
    long countByPriority(MaintenanceRecord.MaintenancePriority priority);
    
    // Count by asset
    long countByAsset(Asset asset);
    
    long countByAssetId(Long assetId);
    
    // Find maintenance records by cost range
    List<MaintenanceRecord> findByCostBetween(BigDecimal minCost, BigDecimal maxCost);
    
    // Find recent maintenance records
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.createdAt >= :date ORDER BY m.createdAt DESC")
    List<MaintenanceRecord> findRecentMaintenanceRecords(@Param("date") LocalDate date);
    
    // Find maintenance records for specific asset and status
    List<MaintenanceRecord> findByAssetAndStatus(Asset asset, MaintenanceRecord.MaintenanceStatus status);
    
    // Find maintenance records by asset and date range
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.asset = :asset " +
           "AND m.maintenanceDate BETWEEN :startDate AND :endDate")
    List<MaintenanceRecord> findByAssetAndDateRange(@Param("asset") Asset asset,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);
    
    // Statistical queries
    @Query("SELECT AVG(m.cost) FROM MaintenanceRecord m WHERE m.cost IS NOT NULL AND m.status = 'COMPLETED'")
    BigDecimal findAverageMaintenanceCost();
    
    @Query("SELECT SUM(m.cost) FROM MaintenanceRecord m WHERE m.cost IS NOT NULL AND m.status = 'COMPLETED'")
    BigDecimal findTotalMaintenanceCost();
    
    @Query("SELECT SUM(m.cost) FROM MaintenanceRecord m WHERE m.cost IS NOT NULL " +
           "AND m.status = 'COMPLETED' AND m.completedDate BETWEEN :startDate AND :endDate")
    BigDecimal findTotalMaintenanceCostBetween(@Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
    
    @Query("SELECT AVG(m.downtimeHours) FROM MaintenanceRecord m WHERE m.downtimeHours IS NOT NULL AND m.status = 'COMPLETED'")
    Double findAverageDowntimeHours();
    
    @Query("SELECT SUM(m.downtimeHours) FROM MaintenanceRecord m WHERE m.downtimeHours IS NOT NULL AND m.status = 'COMPLETED'")
    Long findTotalDowntimeHours();
    
    // Find critical and urgent maintenance
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.priority IN ('CRITICAL', 'URGENT') " +
           "AND m.status IN ('SCHEDULED', 'IN_PROGRESS')")
    List<MaintenanceRecord> findCriticalMaintenanceRecords();
    
    // Find assets with most maintenance records
    @Query("SELECT m.asset, COUNT(m) as maintenanceCount FROM MaintenanceRecord m " +
           "GROUP BY m.asset ORDER BY maintenanceCount DESC")
    List<Object[]> findAssetsWithMostMaintenance();
    
    // Find maintenance types frequency
    @Query("SELECT m.maintenanceType, COUNT(m) as frequency FROM MaintenanceRecord m " +
           "GROUP BY m.maintenanceType ORDER BY frequency DESC")
    List<Object[]> findMaintenanceTypeFrequency();
    
    // Find vendors by maintenance frequency
    @Query("SELECT m.vendor, COUNT(m) as frequency FROM MaintenanceRecord m " +
           "WHERE m.vendor IS NOT NULL GROUP BY m.vendor ORDER BY frequency DESC")
    List<Object[]> findVendorsByMaintenanceFrequency();
    
    // Find distinct maintenance types
    @Query("SELECT DISTINCT m.maintenanceType FROM MaintenanceRecord m WHERE m.maintenanceType IS NOT NULL ORDER BY m.maintenanceType")
    List<String> findDistinctMaintenanceTypes();
    
    // Find distinct vendors
    @Query("SELECT DISTINCT m.vendor FROM MaintenanceRecord m WHERE m.vendor IS NOT NULL ORDER BY m.vendor")
    List<String> findDistinctVendors();
    
    // Find distinct performers
    @Query("SELECT DISTINCT m.performedBy FROM MaintenanceRecord m WHERE m.performedBy IS NOT NULL ORDER BY m.performedBy")
    List<String> findDistinctPerformers();
}