package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.MaintenanceRecordDTO;
import com.chaseelkins.assetmanagement.model.MaintenanceRecord;
import com.chaseelkins.assetmanagement.service.MaintenanceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maintenance")
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<Page<MaintenanceRecord>> getAll(Pageable pageable) {
        return ResponseEntity.ok(maintenanceService.getAll(pageable));
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<MaintenanceRecord>> getByAsset(@PathVariable @Min(1) Long assetId) {
        return ResponseEntity.ok(maintenanceService.getByAsset(assetId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<MaintenanceRecord>> getOverdue() {
        return ResponseEntity.ok(maintenanceService.getOverdue());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<MaintenanceRecord>> getUpcoming(@RequestParam(defaultValue = "7") @Min(1) @Max(365) int days) {
        return ResponseEntity.ok(maintenanceService.getUpcoming(days));
    }

    @GetMapping("/today")
    public ResponseEntity<List<MaintenanceRecord>> getToday() {
        return ResponseEntity.ok(maintenanceService.getToday());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<MaintenanceRecord>> search(@RequestParam String query, Pageable pageable) {
        return ResponseEntity.ok(maintenanceService.search(query, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRecord> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(maintenanceService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<MaintenanceRecord> create(@Valid @RequestBody MaintenanceRecordDTO dto) {
        MaintenanceRecord created = maintenanceService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<MaintenanceRecord> update(@PathVariable Long id, @Valid @RequestBody MaintenanceRecordDTO dto) {
        try {
            return ResponseEntity.ok(maintenanceService.update(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            maintenanceService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
