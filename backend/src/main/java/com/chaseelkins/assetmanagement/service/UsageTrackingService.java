package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.UsageRecord;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.repository.UsageRecordRepository;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsageTrackingService {

    private final AssetRepository assetRepository;
    private final UsageRecordRepository usageRecordRepository;
    private final StripeService stripeService;

    /**
     * Track current usage for a tenant
     */
    @Transactional
    public UsageRecord trackUsage(Long tenantId) {
        log.debug("Tracking usage for tenant: {}", tenantId);

        // Count assets for tenant
        long assetCount = assetRepository.countByTenantId(tenantId);

        // Create usage record
        UsageRecord record = new UsageRecord();
        record.setTenantId(tenantId);
        record.setAssetCount((int) assetCount);
        record.setRecordedAt(LocalDateTime.now());
        record.setReportedToStripe(false);

        return usageRecordRepository.save(record);
    }

    /**
     * Report usage to Stripe for metered billing
     * Scheduled to run daily at 1 AM
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void reportDailyUsageToStripe() {
        log.info("Starting daily usage reporting to Stripe");

        // Get all unreported usage records
        List<UsageRecord> unreportedRecords = usageRecordRepository.findByReportedToStripeFalse();

        for (UsageRecord record : unreportedRecords) {
            try {
                stripeService.reportUsage(record.getTenantId(), record.getAssetCount(), record.getOverageCount());
                
                record.setReportedToStripe(true);
                record.setReportTimestamp(LocalDateTime.now());
                usageRecordRepository.save(record);
                
                log.info("Reported usage for tenant {}: {} assets, {} overage", 
                        record.getTenantId(), record.getAssetCount(), record.getOverageCount());
            } catch (StripeException e) {
                log.error("Error reporting usage for tenant {}", record.getTenantId(), e);
            }
        }

        log.info("Completed daily usage reporting. Reported {} records", unreportedRecords.size());
    }

    /**
     * Check if tenant has exceeded their plan limits
     */
    public boolean hasExceededLimits(Long tenantId) {
        return stripeService.getSubscription(tenantId)
                .map(subscription -> {
                    long assetCount = assetRepository.countByTenantId(tenantId);
                    int assetLimit = subscription.getAssetLimit();
                    
                    // -1 means unlimited
                    if (assetLimit == -1) {
                        return false;
                    }
                    
                    return assetCount > assetLimit;
                })
                .orElse(false);
    }

    /**
     * Get current asset count for tenant
     */
    public int getCurrentAssetCount(Long tenantId) {
        return (int) assetRepository.countByTenantId(tenantId);
    }

    /**
     * Get remaining assets before hitting limit
     */
    public int getRemainingAssets(Long tenantId) {
        return stripeService.getSubscription(tenantId)
                .map(subscription -> {
                    int assetLimit = subscription.getAssetLimit();
                    
                    // -1 means unlimited
                    if (assetLimit == -1) {
                        return Integer.MAX_VALUE;
                    }
                    
                    int currentCount = getCurrentAssetCount(tenantId);
                    return Math.max(0, assetLimit - currentCount);
                })
                .orElse(0);
    }
}
