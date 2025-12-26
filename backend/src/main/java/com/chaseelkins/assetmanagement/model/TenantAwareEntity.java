package com.chaseelkins.assetmanagement.model;

import com.chaseelkins.assetmanagement.tenant.TenantContext;
import jakarta.persistence.*;

/**
 * Base class for all tenant-aware entities.
 * Automatically handles tenant_id assignment and filtering.
 */
@MappedSuperclass
public abstract class TenantAwareEntity {
    
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private Long tenantId;
    
    @PrePersist
    public void onPrePersist() {
        if (this.tenantId == null) {
            this.tenantId = TenantContext.getTenantId();
        }
        if (this.tenantId == null) {
            throw new IllegalStateException("Tenant ID must be set before persisting entity: " + this.getClass().getSimpleName());
        }
    }
    
    public Long getTenantId() {
        return tenantId;
    }
    
    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }
}
