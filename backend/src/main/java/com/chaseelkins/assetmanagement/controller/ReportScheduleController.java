package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.CreateReportScheduleRequest;
import com.chaseelkins.assetmanagement.dto.ReportScheduleDto;
import com.chaseelkins.assetmanagement.service.ReportScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/report-schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Report Schedules", description = "Automated report scheduling and management")
@SecurityRequirement(name = "Bearer Authentication")
public class ReportScheduleController {

    private final ReportScheduleService reportScheduleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    @Operation(summary = "Create a new report schedule", 
               description = "Create a new automated report schedule. Reports will be generated and emailed based on the specified frequency.")
    public ResponseEntity<ReportScheduleDto> createSchedule(@Valid @RequestBody CreateReportScheduleRequest request) {
        try {
            ReportScheduleDto schedule = reportScheduleService.createSchedule(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
        } catch (Exception e) {
            log.error("Error creating report schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN','USER')")
    @Operation(summary = "Get current user's report schedules", 
               description = "Get all report schedules created by the current user.")
    public ResponseEntity<List<ReportScheduleDto>> getUserSchedules() {
        try {
            List<ReportScheduleDto> schedules = reportScheduleService.getUserSchedules();
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            log.error("Error fetching user schedules", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN','USER')")
    @Operation(summary = "Get report schedule by ID", 
               description = "Get a specific report schedule by its ID. Users can only view their own schedules unless they are admins.")
    public ResponseEntity<ReportScheduleDto> getScheduleById(@PathVariable Long id) {
        try {
            ReportScheduleDto schedule = reportScheduleService.getScheduleById(id);
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            log.error("Error fetching schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    @Operation(summary = "Update a report schedule", 
               description = "Update an existing report schedule. Users can only update their own schedules unless they are admins.")
    public ResponseEntity<ReportScheduleDto> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody CreateReportScheduleRequest request) {
        try {
            ReportScheduleDto schedule = reportScheduleService.updateSchedule(id, request);
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            log.error("Error updating schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    @Operation(summary = "Delete a report schedule", 
               description = "Delete a report schedule. Users can only delete their own schedules unless they are admins.")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        try {
            reportScheduleService.deleteSchedule(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            log.error("Error deleting schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    @Operation(summary = "Toggle schedule enabled status", 
               description = "Enable or disable a report schedule. Disabled schedules will not run.")
    public ResponseEntity<ReportScheduleDto> toggleEnabled(@PathVariable Long id) {
        try {
            ReportScheduleDto schedule = reportScheduleService.toggleEnabled(id);
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            log.error("Error toggling schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/test")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Test a report schedule", 
               description = "Manually trigger a report generation for testing. Admin only.")
    public ResponseEntity<Map<String, String>> testSchedule(@PathVariable Long id) {
        try {
            // This would call a report generation service (to be implemented)
            return ResponseEntity.ok(Map.of(
                "message", "Test report generation feature coming soon",
                "scheduleId", id.toString()
            ));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            log.error("Error testing schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
