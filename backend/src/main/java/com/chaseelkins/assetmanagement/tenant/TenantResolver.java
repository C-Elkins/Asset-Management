package com.chaseelkins.assetmanagement.tenant;

import com.chaseelkins.assetmanagement.model.Tenant;
import com.chaseelkins.assetmanagement.repository.TenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resolves tenant ID from subdomain with caching for performance.
 */
@Component
public class TenantResolver {
    
    private static final Logger log = LoggerFactory.getLogger(TenantResolver.class);
    
    // Cache to avoid database lookups on every request
    private final ConcurrentHashMap<String, Long> tenantCache = new ConcurrentHashMap<>();
    
    @Autowired
    private TenantRepository tenantRepository;
    
    /**
     * Resolve tenant ID from subdomain
     */
    public Long resolveTenantId(String subdomain) {
        if (subdomain == null || subdomain.isEmpty()) {
            return null;
        }
        
        // Check cache first
        Long cachedTenantId = tenantCache.get(subdomain);
        if (cachedTenantId != null) {
            return cachedTenantId;
        }
        
        // Query database
        try {
            Optional<Tenant> tenant = tenantRepository.findBySubdomainAndActiveTrue(subdomain);
            if (tenant.isPresent()) {
                Long tenantId = tenant.get().getId();
                tenantCache.put(subdomain, tenantId);
                log.info("Cached tenant ID {} for subdomain: {}", tenantId, subdomain);
                return tenantId;
            } else {
                log.warn("No active tenant found for subdomain: {}", subdomain);
                return null;
            }
        } catch (Exception e) {
            log.error("Error resolving tenant for subdomain: {}", subdomain, e);
            return null;
        }
    }
    
    /**
     * Clear cache for a specific subdomain
     */
    public void clearCache(String subdomain) {
        tenantCache.remove(subdomain);
        log.info("Cleared tenant cache for subdomain: {}", subdomain);
    }
    
    /**
     * Clear all tenant cache
     */
    public void clearAllCache() {
        tenantCache.clear();
        log.info("Cleared all tenant cache");
    }
}
