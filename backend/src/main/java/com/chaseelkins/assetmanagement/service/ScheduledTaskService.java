package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for scheduled tasks like sending maintenance reminders and warranty expiration alerts.
 * Runs daily to check for assets needing attention.
 */
@Service
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;

    public ScheduledTaskService(AssetRepository assetRepository, UserRepository userRepository, EmailService emailService, RateLimitService rateLimitService) {
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.rateLimitService = rateLimitService;
    }

    /**
     * Check for maintenance due and send reminders
     * Runs daily at 8:00 AM
     */
    @Scheduled(cron = "${scheduling.maintenance-check.cron:0 0 8 * * *}")
    public void checkMaintenanceDue() {
        if (!emailService.isConfigured()) {
            logger.debug("Email notifications not configured, skipping maintenance check");
            return;
        }

        logger.info("Running scheduled maintenance due check");

        try {
            LocalDate today = LocalDate.now();
            LocalDate thirtyDaysFromNow = today.plusDays(30);

            // Find assets with maintenance due within 30 days
            List<Asset> assetsNeedingMaintenance = assetRepository.findAll().stream()
                    .filter(asset -> asset.getNextMaintenance() != null)
                    .filter(asset -> !asset.getNextMaintenance().isAfter(thirtyDaysFromNow))
                    .collect(Collectors.toList());

            if (!assetsNeedingMaintenance.isEmpty()) {
                logger.info("Found {} assets needing maintenance", assetsNeedingMaintenance.size());

                // Send digest to all admins
                List<User> admins = userRepository.findByRole(User.Role.SUPER_ADMIN);
                for (User admin : admins) {
                    emailService.sendMaintenanceDueEmail(assetsNeedingMaintenance, admin.getEmail(), admin.getFirstName());
                }

                // Send individual notifications to assigned users
                for (Asset asset : assetsNeedingMaintenance) {
                    if (!asset.getAssignedUsers().isEmpty()) {
                        for (User user : asset.getAssignedUsers()) {
                            emailService.sendMaintenanceDueEmail(List.of(asset), user.getEmail(), user.getFirstName());
                        }
                    }
                }
            } else {
                logger.info("No assets need maintenance in the next 30 days");
            }
        } catch (Exception e) {
            logger.error("Error during scheduled maintenance check", e);
        }
    }

    /**
     * Check for warranties expiring soon and send alerts
     * Runs daily at 8:30 AM
     */
    @Scheduled(cron = "${scheduling.warranty-check.cron:0 30 8 * * *}")
    public void checkWarrantiesExpiring() {
        if (!emailService.isConfigured()) {
            logger.debug("Email notifications not configured, skipping warranty check");
            return;
        }

        logger.info("Running scheduled warranty expiration check");

        try {
            LocalDate today = LocalDate.now();
            LocalDate thirtyDaysFromNow = today.plusDays(30);

            // Find assets with warranties expiring within 30 days
            List<Asset> assetsWithExpiringWarranties = assetRepository.findAll().stream()
                    .filter(asset -> asset.getWarrantyExpiry() != null)
                    .filter(asset -> !asset.getWarrantyExpiry().isBefore(today))
                    .filter(asset -> !asset.getWarrantyExpiry().isAfter(thirtyDaysFromNow))
                    .collect(Collectors.toList());

            if (!assetsWithExpiringWarranties.isEmpty()) {
                logger.info("Found {} assets with expiring warranties", assetsWithExpiringWarranties.size());

                // Send digest to all admins
                List<User> admins = userRepository.findByRole(User.Role.SUPER_ADMIN);
                for (User admin : admins) {
                    emailService.sendWarrantyExpiringEmail(assetsWithExpiringWarranties, admin.getEmail(), admin.getFirstName());
                }

                // Send individual notifications to assigned users
                for (Asset asset : assetsWithExpiringWarranties) {
                    if (!asset.getAssignedUsers().isEmpty()) {
                        for (User user : asset.getAssignedUsers()) {
                            emailService.sendWarrantyExpiringEmail(List.of(asset), user.getEmail(), user.getFirstName());
                        }
                    }
                }
            } else {
                logger.info("No warranties expiring in the next 30 days");
            }
        } catch (Exception e) {
            logger.error("Error during scheduled warranty check", e);
        }
    }

    /**
     * Manual trigger for testing (can be called via controller endpoint)
     */
    public void triggerMaintenanceCheck() {
        logger.info("Manually triggered maintenance check");
        checkMaintenanceDue();
    }

    /**
     * Manual trigger for testing (can be called via controller endpoint)
     */
    public void triggerWarrantyCheck() {
        logger.info("Manually triggered warranty check");
        checkWarrantiesExpiring();
    }

    /**
     * Clean up expired rate limit entries
     * Runs every hour to free up memory
     */
    @Scheduled(cron = "${scheduling.rate-limit-cleanup.cron:0 0 * * * *}")
    public void cleanupRateLimits() {
        logger.debug("Running rate limit cleanup");
        rateLimitService.cleanup();
    }
}
