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
 * Creates a default admin user for development environment.
 * Only runs in 'dev' profile with simple, known credentials.
 */
@Component
@Profile("dev")
public class DevAdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public DevAdminInitializer(UserRepository userRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        boolean hasAdmin = userRepository.countByRole(User.Role.SUPER_ADMIN) > 0
                || userRepository.countByRole(User.Role.IT_ADMIN) > 0;
        if (hasAdmin) {
            log.info("Admin user already exists, skipping dev admin creation");
            return;
        }

        String username = "admin";
        String email = "admin@dev.local";
        String devPassword = "admin123"; // Simple password for development

        User devAdmin = new User(
            username,
            email,
            encoder.encode(devPassword),
            "Dev",
            "Administrator",
            "IT",
            "System Administrator",
            null,
            User.Role.SUPER_ADMIN,
            true,  // active
            false  // mustChangePassword: false for dev convenience
        );
        
        userRepository.save(devAdmin);

        log.warn("================ DEV ADMIN CREATED ================");
        log.warn("Username: {}", username);
        log.warn("Password: {}", devPassword);
        log.warn("Email: {}", email);
        log.warn("Note: This is for development only!");
        log.warn("==================================================");
    }
}
