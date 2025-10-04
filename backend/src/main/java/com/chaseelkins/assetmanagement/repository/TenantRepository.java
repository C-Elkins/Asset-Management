package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Tenant entity operations.
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    /**
     * Find tenant by subdomain
     */
    Optional<Tenant> findBySubdomain(String subdomain);
    
    /**
     * Find active tenant by subdomain
     */
    Optional<Tenant> findBySubdomainAndActiveTrue(String subdomain);
    
    /**
     * Check if subdomain exists
     */
    boolean existsBySubdomain(String subdomain);
    
    /**
     * Find tenant by custom domain
     */
    Optional<Tenant> findByCustomDomain(String customDomain);
    
    /**
     * Find tenant by Stripe customer ID
     */
    Optional<Tenant> findByStripeCustomerId(String stripeCustomerId);
    
    /**
     * Count users for a tenant
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.tenantId = :tenantId")
    long countUsersByTenantId(Long tenantId);
    
    /**
     * Count assets for a tenant
     */
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.tenantId = :tenantId")
    long countAssetsByTenantId(Long tenantId);
}
