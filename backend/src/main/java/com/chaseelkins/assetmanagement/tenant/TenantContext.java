package com.chaseelkins.assetmanagement.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Thread-local storage for the current tenant context.
 * This ensures that each HTTP request operates within the correct tenant scope.
 */
public class TenantContext {
    
    private static final Logger log = LoggerFactory.getLogger(TenantContext.class);
    
    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_SUBDOMAIN = new ThreadLocal<>();
    
    private TenantContext() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Set the current tenant ID for the request
     */
    public static void setTenantId(Long tenantId) {
        log.debug("Setting tenant ID: {}", tenantId);
        CURRENT_TENANT.set(tenantId);
    }
    
    /**
     * Get the current tenant ID
     */
    public static Long getTenantId() {
        Long tenantId = CURRENT_TENANT.get();
        if (tenantId == null) {
            log.warn("No tenant ID set in context - this may indicate a configuration issue");
        }
        return tenantId;
    }
    
    /**
     * Set the current subdomain
     */
    public static void setSubdomain(String subdomain) {
        log.debug("Setting subdomain: {}", subdomain);
        CURRENT_SUBDOMAIN.set(subdomain);
    }
    
    /**
     * Get the current subdomain
     */
    public static String getSubdomain() {
        return CURRENT_SUBDOMAIN.get();
    }
    
    /**
     * Clear the tenant context (important to prevent memory leaks)
     */
    public static void clear() {
        log.debug("Clearing tenant context");
        CURRENT_TENANT.remove();
        CURRENT_SUBDOMAIN.remove();
    }
    
    /**
     * Check if a tenant is currently set
     */
    public static boolean isSet() {
        return CURRENT_TENANT.get() != null;
    }
}
