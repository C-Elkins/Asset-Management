package com.chaseelkins.assetmanagement.config;

import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Seeds a single SUPER_ADMIN user if none exist. Active in all profiles except 'dev'
 * (dev seeding handled by DevDataInitializer). The generated password is logged ONCE
 * at startup. Operators should immediately change this password post-deployment.
 */
@Component
@Profile("!dev")
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final HexFormat HEX = HexFormat.of();

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        boolean hasAdmin = userRepository.countByRole(User.Role.SUPER_ADMIN) > 0
                || userRepository.countByRole(User.Role.IT_ADMIN) > 0;
        if (hasAdmin) {
            return; // At least one admin present—no action.
        }

        String username = "admin";
        String email = "admin@local";
        String tempPassword = generateStrongPassword();

        User user = new User(
                username,
                email,
                encoder.encode(tempPassword),
                "System",
                "Administrator",
                "IT",
                "Platform Admin",
                null,
                User.Role.SUPER_ADMIN,
                true
        );
        userRepository.save(user);

        log.warn("================ INITIAL ADMIN CREATED ================");
        log.warn("Username: {}", username);
        log.warn("Temporary Password: {}", tempPassword);
        log.warn("IMPORTANT: Change this password immediately after first login.");
        log.warn("=======================================================");
    }

    private String generateStrongPassword() {
        // 24 random bytes -> 48 hex chars
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return HEX.formatHex(bytes);
    }
}
