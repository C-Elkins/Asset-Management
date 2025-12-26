package com.chaseelkins.assetmanagement.tenant;

import org.hibernate.CallbackException;
import org.hibernate.Interceptor;
import org.hibernate.type.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.Serializable;

/**
 * Hibernate interceptor that automatically sets tenant_id on entity save/update operations.
 * This provides an additional layer of security ensuring tenant isolation at the ORM level.
 */
@Component
public class TenantInterceptor implements Interceptor {
    
    private static final Logger log = LoggerFactory.getLogger(TenantInterceptor.class);
    
    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, 
                          String[] propertyNames, Type[] types) throws CallbackException {
        
        if (entity instanceof com.chaseelkins.assetmanagement.model.TenantAwareEntity) {
            Long tenantId = TenantContext.getTenantId();
            
            if (tenantId == null) {
                log.error("Attempting to save entity without tenant context: {}", entity.getClass().getSimpleName());
                throw new IllegalStateException("Tenant ID must be set before saving entity");
            }
            
            // Find tenant_id property and set it
            for (int i = 0; i < propertyNames.length; i++) {
                if ("tenantId".equals(propertyNames[i])) {
                    state[i] = tenantId;
                    log.debug("Set tenant_id={} for entity: {}", tenantId, entity.getClass().getSimpleName());
                    return true;
                }
            }
        }
        
        return false;
    }
    
    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, 
                                Object[] previousState, String[] propertyNames, Type[] types) 
                                throws CallbackException {
        
        if (entity instanceof com.chaseelkins.assetmanagement.model.TenantAwareEntity) {
            Long currentTenantId = TenantContext.getTenantId();
            
            if (currentTenantId == null) {
                log.error("Attempting to update entity without tenant context: {}", entity.getClass().getSimpleName());
                throw new IllegalStateException("Tenant ID must be set before updating entity");
            }
            
            // Verify tenant_id hasn't been changed (security check)
            for (int i = 0; i < propertyNames.length; i++) {
                if ("tenantId".equals(propertyNames[i])) {
                    Long existingTenantId = (Long) previousState[i];
                    if (existingTenantId != null && !existingTenantId.equals(currentTenantId)) {
                        log.error("Attempted to change tenant_id from {} to {} for entity: {}", 
                                existingTenantId, currentTenantId, entity.getClass().getSimpleName());
                        throw new SecurityException("Cannot change tenant_id of existing entity");
                    }
                }
            }
        }
        
        return false;
    }
    
    @Override
    public void onDelete(Object entity, Serializable id, Object[] state, 
                        String[] propertyNames, Type[] types) throws CallbackException {
        
        if (entity instanceof com.chaseelkins.assetmanagement.model.TenantAwareEntity) {
            Long currentTenantId = TenantContext.getTenantId();
            
            if (currentTenantId == null) {
                log.error("Attempting to delete entity without tenant context: {}", entity.getClass().getSimpleName());
                throw new IllegalStateException("Tenant ID must be set before deleting entity");
            }
            
            // Verify entity belongs to current tenant
            for (int i = 0; i < propertyNames.length; i++) {
                if ("tenantId".equals(propertyNames[i])) {
                    Long entityTenantId = (Long) state[i];
                    if (entityTenantId != null && !entityTenantId.equals(currentTenantId)) {
                        log.error("Attempted to delete entity from different tenant. Entity tenant: {}, Current tenant: {}", 
                                entityTenantId, currentTenantId);
                        throw new SecurityException("Cannot delete entity from different tenant");
                    }
                }
            }
        }
    }
}
