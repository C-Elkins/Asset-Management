package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.UsageRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsageRecordRepository extends JpaRepository<UsageRecord, Long> {
    
    Page<UsageRecord> findByTenantIdOrderByRecordedAtDesc(Long tenantId, Pageable pageable);
    
    Optional<UsageRecord> findFirstByTenantIdOrderByRecordedAtDesc(Long tenantId);
    
    List<UsageRecord> findByReportedToStripeFalse();
    
    @Query("SELECT ur FROM UsageRecord ur WHERE ur.tenantId = :tenantId " +
           "AND ur.recordedAt BETWEEN :startDate AND :endDate ORDER BY ur.recordedAt DESC")
    List<UsageRecord> findByTenantIdAndDateRange(Long tenantId, LocalDateTime startDate, LocalDateTime endDate);
}
