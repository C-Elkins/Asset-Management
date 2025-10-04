package com.chaseelkins.assetmanagement.tenant;

import org.hibernate.cfg.AvailableSettings;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Resolves the current tenant identifier for Hibernate multi-tenancy.
 * This integrates with Hibernate's tenant resolution mechanism.
 */
@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver, HibernatePropertiesCustomizer {
    
    private static final String DEFAULT_TENANT = "default";
    
    @Override
    public String resolveCurrentTenantIdentifier() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return DEFAULT_TENANT;
        }
        return tenantId.toString();
    }
    
    @Override
    public boolean validateExistingCurrentSessions() {
        // We don't want Hibernate to validate existing sessions against the current tenant
        return false;
    }
    
    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, this);
    }
}
