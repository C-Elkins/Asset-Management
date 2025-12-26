package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.UserConsent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserConsentRepository extends JpaRepository<UserConsent, Long> {
    
    /**
     * Find consent record for a specific user within their tenant
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.userId = :userId AND uc.tenantId = :tenantId")
    Optional<UserConsent> findByUserIdAndTenantId(@Param("userId") Long userId, @Param("tenantId") Long tenantId);
    
    /**
     * Find all consent records for a tenant (for admin purposes)
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId")
    Page<UserConsent> findByTenantId(@Param("tenantId") Long tenantId, Pageable pageable);
    
    /**
     * Find all consent records for a tenant without pagination
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId")
    List<UserConsent> findAllByTenantId(@Param("tenantId") Long tenantId);
    
    /**
     * Check if a user has any consent record within their tenant
     */
    @Query("SELECT COUNT(uc) > 0 FROM UserConsent uc WHERE uc.userId = :userId AND uc.tenantId = :tenantId")
    boolean existsByUserIdAndTenantId(@Param("userId") Long userId, @Param("tenantId") Long tenantId);
    
    /**
     * Find users who have consented to marketing emails within a tenant
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId AND uc.marketingEmails = true")
    List<UserConsent> findByTenantIdAndMarketingEmailsTrue(@Param("tenantId") Long tenantId);
    
    /**
     * Find users who have consented to analytics within a tenant
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId AND uc.analytics = true")
    List<UserConsent> findByTenantIdAndAnalyticsTrue(@Param("tenantId") Long tenantId);
    
    /**
     * Find consent records by consent version within a tenant (for audit purposes)
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId AND uc.consentVersion = :version")
    List<UserConsent> findByTenantIdAndConsentVersion(@Param("tenantId") Long tenantId, @Param("version") String version);
    
    /**
     * Find consent records created after a specific date within a tenant
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId AND uc.createdAt >= :since")
    List<UserConsent> findByTenantIdAndCreatedAtAfter(@Param("tenantId") Long tenantId, @Param("since") LocalDateTime since);
    
    /**
     * Find consent records updated after a specific date within a tenant
     */
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId AND uc.updatedAt >= :since")
    List<UserConsent> findByTenantIdAndUpdatedAtAfter(@Param("tenantId") Long tenantId, @Param("since") LocalDateTime since);
    
    /**
     * Count total consent records for a tenant
     */
    @Query("SELECT COUNT(uc) FROM UserConsent uc WHERE uc.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") Long tenantId);
    
    /**
     * Count users with marketing email consent for a tenant
     */
    @Query("SELECT COUNT(uc) FROM UserConsent uc WHERE uc.tenantId = :tenantId AND uc.marketingEmails = true")
    long countByTenantIdAndMarketingEmailsTrue(@Param("tenantId") Long tenantId);
    
    /**
     * Count users with analytics consent for a tenant
     */
    @Query("SELECT COUNT(uc) FROM UserConsent uc WHERE uc.tenantId = :tenantId AND uc.analytics = true")
    long countByTenantIdAndAnalyticsTrue(@Param("tenantId") Long tenantId);
    
    /**
     * Delete consent record for a specific user within their tenant
     * (used for data deletion requests)
     */
    @Query("DELETE FROM UserConsent uc WHERE uc.userId = :userId AND uc.tenantId = :tenantId")
    void deleteByUserIdAndTenantId(@Param("userId") Long userId, @Param("tenantId") Long tenantId);
}
