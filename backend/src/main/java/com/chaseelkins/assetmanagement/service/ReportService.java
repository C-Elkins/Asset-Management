package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportService {
    
    private static final Logger log = LoggerFactory.getLogger(ReportService.class);
    
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    // CategoryRepository reserved for future reporting features
    
    public ReportService(AssetRepository assetRepository,
                        UserRepository userRepository) {
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Generate dashboard summary data
     */
    public Map<String, Object> getDashboardSummary() {
        log.info("Generating dashboard summary");
        
        Map<String, Object> summary = new HashMap<>();
        
        // Asset statistics
        long totalAssets = assetRepository.count();
        long availableAssets = assetRepository.countByStatus(Asset.AssetStatus.AVAILABLE);
        long assignedAssets = assetRepository.countByStatus(Asset.AssetStatus.ASSIGNED);
        long maintenanceAssets = assetRepository.countByStatus(Asset.AssetStatus.IN_MAINTENANCE);
        
        summary.put("totalAssets", totalAssets);
        summary.put("availableAssets", availableAssets);
        summary.put("assignedAssets", assignedAssets);
        summary.put("maintenanceAssets", maintenanceAssets);
        
        // User statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActive(true);
        
        summary.put("totalUsers", totalUsers);
        summary.put("activeUsers", activeUsers);
        
        // Financial statistics
        BigDecimal totalAssetValue = assetRepository.findTotalAssetValue();
        summary.put("totalAssetValue", totalAssetValue != null ? totalAssetValue : BigDecimal.ZERO);
        
        // Recent alerts
        List<String> alerts = generateAlerts();
        summary.put("alerts", alerts);
        
        return summary;
    }
    
    /**
     * Generate alerts for dashboard
     */
    private List<String> generateAlerts() {
        List<String> alerts = new ArrayList<>();
        
        // Add some basic alerts
        alerts.add("System running normally");
        
        return alerts;
    }
}