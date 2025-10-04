package com.chaseelkins.assetmanagement.config;

import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DISABLED: Multi-tenant systems should use TenantController.registerTenant() instead.
 * This initializer is no longer needed as each tenant creates their own admin during registration.
 */
@Component
@Profile("disabled-for-multitenant")  // Changed from "dev" to disable this initializer
public class DevAdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAdminInitializer.class);

    @SuppressWarnings("unused")
    private final UserRepository userRepository;
    @SuppressWarnings("unused")
    private final PasswordEncoder encoder;

    public DevAdminInitializer(UserRepository userRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        log.info("DevAdminInitializer is disabled for multi-tenant setup. Use POST /api/v1/tenants/register instead.");
    }
}
