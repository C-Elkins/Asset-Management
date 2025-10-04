package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.TenantRegistrationDTO;
import com.chaseelkins.assetmanagement.dto.UserDTO;
import com.chaseelkins.assetmanagement.model.Tenant;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.model.SubscriptionTier;
import com.chaseelkins.assetmanagement.service.TenantService;
import com.chaseelkins.assetmanagement.service.UserService;
import com.chaseelkins.assetmanagement.tenant.TenantContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST API controller for tenant (organization) management in multi-tenant SaaS.
 */
@RestController
@RequestMapping("/tenants")
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class TenantController {
    
    @Autowired
    private TenantService tenantService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Register a new tenant (organization signup)
     * This is the only endpoint that doesn't require authentication
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerTenant(@Valid @RequestBody TenantRegistrationDTO registrationDTO) {
        try {
            // Create tenant
            Tenant tenant = new Tenant();
            tenant.setName(registrationDTO.getName());
            tenant.setSubdomain(registrationDTO.getSubdomain().toLowerCase());
            tenant.setDescription(registrationDTO.getDescription());
            tenant.setContactEmail(registrationDTO.getContactEmail());
            tenant.setContactName(registrationDTO.getContactName());
            tenant.setPhoneNumber(registrationDTO.getPhoneNumber());
            tenant.setSubscriptionTier(registrationDTO.getSubscriptionTier() != null ? 
                registrationDTO.getSubscriptionTier() : SubscriptionTier.FREE);
            
            Tenant createdTenant = tenantService.createTenant(tenant);
            
            // Set tenant context for admin user creation
            TenantContext.setTenantId(createdTenant.getId());
            
            // Create admin user for the tenant using UserDTO
            UserDTO adminUserDTO = new UserDTO();
            adminUserDTO.setUsername(registrationDTO.getAdminUsername());
            adminUserDTO.setEmail(registrationDTO.getAdminEmail());
            adminUserDTO.setPassword(registrationDTO.getAdminPassword());
            adminUserDTO.setFirstName(registrationDTO.getAdminFirstName());
            adminUserDTO.setLastName(registrationDTO.getAdminLastName());
            adminUserDTO.setRole(User.Role.SUPER_ADMIN);
            adminUserDTO.setActive(true);
            adminUserDTO.setMustChangePassword(false);
            
            userService.createUser(adminUserDTO);
            
            // Clear tenant context
            TenantContext.clear();
            
            Map<String, Object> response = new HashMap<>();
            response.put("tenant", createdTenant);
            response.put("message", "Tenant registered successfully");
            response.put("subdomain", createdTenant.getSubdomain());
            response.put("loginUrl", "https://" + createdTenant.getSubdomain() + ".yourdomain.com/login");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to register tenant: " + e.getMessage()));
        }
    }
    
    /**
     * Get all tenants (Super Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<Tenant>> getAllTenants(Pageable pageable) {
        Page<Tenant> tenants = tenantService.getAllTenants(pageable);
        return ResponseEntity.ok(tenants);
    }
    
    /**
     * Get tenant by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Tenant> getTenantById(@PathVariable @Min(1) Long id) {
        try {
            Tenant tenant = tenantService.getTenantById(id);
            return ResponseEntity.ok(tenant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get current tenant info
     */
    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentTenant() {
        try {
            Long tenantId = TenantContext.getTenantId();
            if (tenantId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "No tenant context found"));
            }
            
            Tenant tenant = tenantService.getTenantById(tenantId);
            
            // Add usage statistics
            Map<String, Object> response = new HashMap<>();
            response.put("tenant", tenant);
            response.put("userCount", tenantService.hasReachedUserLimit(tenantId) ? 
                tenant.getMaxUsers() : null);
            response.put("assetCount", tenantService.hasReachedAssetLimit(tenantId) ? 
                tenant.getMaxAssets() : null);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update tenant
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Tenant> updateTenant(@PathVariable @Min(1) Long id, 
                                                @Valid @RequestBody Tenant tenant) {
        try {
            Tenant updatedTenant = tenantService.updateTenant(id, tenant);
            return ResponseEntity.ok(updatedTenant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update subscription tier
     */
    @PatchMapping("/{id}/subscription")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Tenant> updateSubscription(@PathVariable @Min(1) Long id, 
                                                       @RequestParam SubscriptionTier tier) {
        try {
            Tenant updatedTenant = tenantService.updateSubscriptionTier(id, tier);
            return ResponseEntity.ok(updatedTenant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Activate/deactivate tenant
     */
    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Tenant> setTenantActive(@PathVariable @Min(1) Long id, 
                                                    @RequestParam boolean active) {
        try {
            Tenant tenant = tenantService.setTenantActive(id, active);
            return ResponseEntity.ok(tenant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete tenant (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteTenant(@PathVariable @Min(1) Long id) {
        try {
            tenantService.deleteTenant(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Check subdomain availability
     */
    @GetMapping("/check-subdomain")
    public ResponseEntity<Map<String, Boolean>> checkSubdomainAvailability(@RequestParam String subdomain) {
        boolean available = !tenantService.getTenantBySubdomain(subdomain.toLowerCase()).isPresent();
        return ResponseEntity.ok(Map.of("available", available));
    }
}
