package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.Tenant;
import com.chaseelkins.assetmanagement.model.SubscriptionTier;
import com.chaseelkins.assetmanagement.repository.TenantRepository;
import com.chaseelkins.assetmanagement.tenant.TenantResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for managing tenants in the multi-tenant SaaS application.
 */
@Service
@Transactional
public class TenantService {
    
    private static final Logger log = LoggerFactory.getLogger(TenantService.class);
    
    @Autowired
    private TenantRepository tenantRepository;
    
    @Autowired
    private TenantResolver tenantResolver;
    
    /**
     * Create a new tenant (organization registration)
     */
    public Tenant createTenant(Tenant tenant) {
        // Validate subdomain is unique
        if (tenantRepository.existsBySubdomain(tenant.getSubdomain())) {
            throw new IllegalArgumentException("Subdomain '" + tenant.getSubdomain() + "' is already taken");
        }
        
        // Set defaults for new tenant
        if (tenant.getSubscriptionTier() == null) {
            tenant.setSubscriptionTier(SubscriptionTier.FREE);
        }
        
        if (tenant.getMaxUsers() == null) {
            tenant.setMaxUsers(getDefaultMaxUsers(tenant.getSubscriptionTier()));
        }
        
        if (tenant.getMaxAssets() == null) {
            tenant.setMaxAssets(getDefaultMaxAssets(tenant.getSubscriptionTier()));
        }
        
        if (tenant.getSubscriptionStartDate() == null) {
            tenant.setSubscriptionStartDate(LocalDateTime.now());
        }
        
        tenant.setActive(true);
        
        Tenant savedTenant = tenantRepository.save(tenant);
        log.info("Created new tenant: {} (subdomain: {})", savedTenant.getName(), savedTenant.getSubdomain());
        
        return savedTenant;
    }
    
    /**
     * Get tenant by ID
     */
    public Tenant getTenantById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with id: " + id));
    }
    
    /**
     * Get tenant by subdomain
     */
    public Optional<Tenant> getTenantBySubdomain(String subdomain) {
        return tenantRepository.findBySubdomain(subdomain);
    }
    
    /**
     * Get all tenants with pagination
     */
    public Page<Tenant> getAllTenants(Pageable pageable) {
        return tenantRepository.findAll(pageable);
    }
    
    /**
     * Update tenant
     */
    public Tenant updateTenant(Long id, Tenant updatedTenant) {
        Tenant existingTenant = getTenantById(id);
        
        // Update allowed fields
        existingTenant.setName(updatedTenant.getName());
        existingTenant.setDescription(updatedTenant.getDescription());
        existingTenant.setContactEmail(updatedTenant.getContactEmail());
        existingTenant.setContactName(updatedTenant.getContactName());
        existingTenant.setPhoneNumber(updatedTenant.getPhoneNumber());
        existingTenant.setLogoUrl(updatedTenant.getLogoUrl());
        existingTenant.setPrimaryColor(updatedTenant.getPrimaryColor());
        existingTenant.setCustomDomain(updatedTenant.getCustomDomain());
        
        // Note: subdomain cannot be changed after creation for security
        
        Tenant saved = tenantRepository.save(existingTenant);
        
        // Clear cache for this tenant
        tenantResolver.clearCache(saved.getSubdomain());
        
        log.info("Updated tenant: {} (id: {})", saved.getName(), saved.getId());
        return saved;
    }
    
    /**
     * Update subscription tier
     */
    public Tenant updateSubscriptionTier(Long id, SubscriptionTier newTier) {
        Tenant tenant = getTenantById(id);
        
        SubscriptionTier oldTier = tenant.getSubscriptionTier();
        tenant.setSubscriptionTier(newTier);
        tenant.setMaxUsers(getDefaultMaxUsers(newTier));
        tenant.setMaxAssets(getDefaultMaxAssets(newTier));
        
        Tenant saved = tenantRepository.save(tenant);
        log.info("Updated tenant {} subscription: {} -> {}", tenant.getName(), oldTier, newTier);
        
        return saved;
    }
    
    /**
     * Activate/deactivate tenant
     */
    public Tenant setTenantActive(Long id, boolean active) {
        Tenant tenant = getTenantById(id);
        tenant.setActive(active);
        
        Tenant saved = tenantRepository.save(tenant);
        
        // Clear cache
        tenantResolver.clearCache(saved.getSubdomain());
        
        log.info("Tenant {} set to active={}", saved.getName(), active);
        return saved;
    }
    
    /**
     * Delete tenant (soft delete by deactivating)
     */
    public void deleteTenant(Long id) {
        setTenantActive(id, false);
        log.info("Deleted (deactivated) tenant with id: {}", id);
    }
    
    /**
     * Check if tenant has reached user limit
     */
    public boolean hasReachedUserLimit(Long tenantId) {
        Tenant tenant = getTenantById(tenantId);
        long currentUserCount = tenantRepository.countUsersByTenantId(tenantId);
        return currentUserCount >= tenant.getMaxUsers();
    }
    
    /**
     * Check if tenant has reached asset limit
     */
    public boolean hasReachedAssetLimit(Long tenantId) {
        Tenant tenant = getTenantById(tenantId);
        long currentAssetCount = tenantRepository.countAssetsByTenantId(tenantId);
        return currentAssetCount >= tenant.getMaxAssets();
    }
    
    /**
     * Get default max users for subscription tier
     */
    private Integer getDefaultMaxUsers(SubscriptionTier tier) {
        return switch (tier) {
            case FREE -> 5;
            case BASIC -> 25;
            case PROFESSIONAL -> 100;
            case ENTERPRISE -> 999999;
        };
    }
    
    /**
     * Get default max assets for subscription tier
     */
    private Integer getDefaultMaxAssets(SubscriptionTier tier) {
        return switch (tier) {
            case FREE -> 100;
            case BASIC -> 1000;
            case PROFESSIONAL -> 10000;
            case ENTERPRISE -> 999999;
        };
    }
}
