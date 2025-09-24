package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.MaintenanceRecordDTO;
import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.MaintenanceRecord;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.repository.MaintenanceRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class MaintenanceService {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceService.class);

    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository, AssetRepository assetRepository, UserRepository userRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
    }

    public MaintenanceRecord create(MaintenanceRecordDTO dto) {
        log.info("Creating maintenance record for asset: {}", dto.getAssetId());

        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found with ID: " + dto.getAssetId()));

        User createdBy = null;
        if (dto.getCreatedByUserId() != null) {
            createdBy = userRepository.findById(dto.getCreatedByUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getCreatedByUserId()));
        }

        MaintenanceRecord record = new MaintenanceRecord();
        record.setMaintenanceType(dto.getMaintenanceType());
        record.setDescription(dto.getDescription());
        record.setMaintenanceDate(dto.getMaintenanceDate());
        record.setCompletedDate(dto.getCompletedDate());
        record.setStatus(dto.getStatus() != null ? dto.getStatus() : MaintenanceRecord.MaintenanceStatus.SCHEDULED);
        record.setPriority(dto.getPriority() != null ? dto.getPriority() : MaintenanceRecord.MaintenancePriority.MEDIUM);
        record.setPerformedBy(dto.getPerformedBy());
        record.setVendor(dto.getVendor());
        record.setCost(dto.getCost());
        record.setNextMaintenanceDate(dto.getNextMaintenanceDate());
        record.setNotes(dto.getNotes());
        record.setPartsUsed(dto.getPartsUsed());
        record.setDowntimeHours(dto.getDowntimeHours());
        record.setAsset(asset);
        record.setCreatedBy(createdBy);

        return maintenanceRepository.save(record);
    }

    public MaintenanceRecord update(Long id, MaintenanceRecordDTO dto) {
        log.info("Updating maintenance record: {}", id);

        MaintenanceRecord existing = getById(id);

        if (dto.getAssetId() != null && (existing.getAsset() == null || !existing.getAsset().getId().equals(dto.getAssetId()))) {
            Asset asset = assetRepository.findById(dto.getAssetId())
                    .orElseThrow(() -> new RuntimeException("Asset not found with ID: " + dto.getAssetId()));
            existing.setAsset(asset);
        }

        if (dto.getCreatedByUserId() != null) {
            User createdBy = userRepository.findById(dto.getCreatedByUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getCreatedByUserId()));
            existing.setCreatedBy(createdBy);
        }

        existing.setMaintenanceType(dto.getMaintenanceType());
        existing.setDescription(dto.getDescription());
        existing.setMaintenanceDate(dto.getMaintenanceDate());
        existing.setCompletedDate(dto.getCompletedDate());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
        if (dto.getPriority() != null) existing.setPriority(dto.getPriority());
        existing.setPerformedBy(dto.getPerformedBy());
        existing.setVendor(dto.getVendor());
        existing.setCost(dto.getCost());
        existing.setNextMaintenanceDate(dto.getNextMaintenanceDate());
        existing.setNotes(dto.getNotes());
        existing.setPartsUsed(dto.getPartsUsed());
        existing.setDowntimeHours(dto.getDowntimeHours());

        return maintenanceRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public MaintenanceRecord getById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with ID: " + id));
    }

    public void delete(Long id) {
        log.info("Deleting maintenance record: {}", id);
        MaintenanceRecord existing = getById(id);
        maintenanceRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceRecord> getAll(Pageable pageable) {
        return maintenanceRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRecord> getByAsset(Long assetId) {
        return maintenanceRepository.findByAssetId(assetId);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRecord> getOverdue() {
        return maintenanceRepository.findOverdueMaintenanceRecords();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRecord> getUpcoming(int days) {
        return maintenanceRepository.findUpcomingMaintenanceRecords(LocalDate.now().plusDays(days));
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRecord> getToday() {
        return maintenanceRepository.findTodaysMaintenanceRecords();
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceRecord> search(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return getAll(pageable);
        }
        return maintenanceRepository.searchMaintenanceRecords(query.trim(), pageable);
    }
}
