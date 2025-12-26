package com.chaseelkins.assetmanagement.config;

import com.chaseelkins.assetmanagement.model.Tenant;
import com.chaseelkins.assetmanagement.model.SubscriptionTier;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.TenantRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import com.chaseelkins.assetmanagement.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Development Data Seeder - Production-Ready Approach
 * 
 * Automatically seeds default tenant and users for development environment.
 * Only runs when 'dev' profile is active.
 * 
 * Default Credentials:
 * - Admin: admin@devorg.com / DevAdmin123!
 * - User: user@devorg.com / DevUser123!
 */
@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevDataSeeder(TenantRepository tenantRepository, 
                         UserRepository userRepository, 
                         PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== Starting Development Data Seeding ===");
        
        // Check if data already exists
        if (tenantRepository.count() > 0) {
            log.info("Database already contains tenants. Skipping seeding.");
            log.info("To reset database, restart the application (H2 in-memory will clear)");
            return;
        }

        // 1. Create Development Tenant
        Tenant devTenant = createDevelopmentTenant();
        log.info("✅ Created tenant: {} (subdomain: {})", devTenant.getName(), devTenant.getSubdomain());

        // Set tenant context for user creation
        TenantContext.setTenantId(devTenant.getId());
        
        try {
            // 2. Create Admin User
            User adminUser = createAdminUser(devTenant);
            log.info("✅ Created admin user: {} (email: {})", adminUser.getUsername(), adminUser.getEmail());

            // 3. Create Regular User
            User regularUser = createRegularUser(devTenant);
            log.info("✅ Created regular user: {} (email: {})", regularUser.getUsername(), regularUser.getEmail());

            log.info("");
            log.info("╔════════════════════════════════════════════════════════════╗");
            log.info("║          DEVELOPMENT LOGIN CREDENTIALS                      ║");
            log.info("╠════════════════════════════════════════════════════════════╣");
            log.info("║  Admin Account:                                             ║");
            log.info("║    Email:    admin@devorg.com                               ║");
            log.info("║    Password: DevAdmin123!                                   ║");
            log.info("║                                                             ║");
            log.info("║  Regular User Account:                                      ║");
            log.info("║    Email:    user@devorg.com                                ║");
            log.info("║    Password: DevUser123!                                    ║");
            log.info("╚════════════════════════════════════════════════════════════╝");
            log.info("");
            log.info("=== Development Data Seeding Complete ===");
            
        } finally {
            // Always clear tenant context
            TenantContext.clear();
        }
    }

    private Tenant createDevelopmentTenant() {
        Tenant tenant = new Tenant();
        tenant.setName("Development Organization");
        tenant.setSubdomain("default");
        tenant.setContactEmail("admin@devorg.com");
        tenant.setContactName("Dev Admin");
        tenant.setDescription("Default development tenant for local testing");
        tenant.setActive(true);
        tenant.setSubscriptionTier(SubscriptionTier.ENTERPRISE); // Give dev full access
        tenant.setMaxUsers(100);
        tenant.setMaxAssets(1000);
        tenant.setSubscriptionStartDate(LocalDateTime.now());
        tenant.setSubscriptionEndDate(LocalDateTime.now().plusYears(10)); // Far future
        
        return tenantRepository.save(tenant);
    }

    private User createAdminUser(Tenant tenant) {
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@devorg.com");
        admin.setPassword(passwordEncoder.encode("DevAdmin123!"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole(User.Role.SUPER_ADMIN);
        admin.setAuthProvider(User.AuthProvider.LOCAL);
        admin.setActive(true);
        admin.setMustChangePassword(false);
        admin.setDepartment("IT");
        admin.setJobTitle("System Administrator");
        admin.setTenantId(tenant.getId());
        
        return userRepository.save(admin);
    }

    private User createRegularUser(Tenant tenant) {
        User user = new User();
        user.setUsername("user");
        user.setEmail("user@devorg.com");
        user.setPassword(passwordEncoder.encode("DevUser123!"));
        user.setFirstName("Regular");
        user.setLastName("User");
        user.setRole(User.Role.USER);
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setActive(true);
        user.setMustChangePassword(false);
        user.setDepartment("Operations");
        user.setJobTitle("Employee");
        user.setTenantId(tenant.getId());
        
        return userRepository.save(user);
    }
}
