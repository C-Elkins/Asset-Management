package com.chaseelkins.assetmanagement.dto;

import com.chaseelkins.assetmanagement.model.ReportSchedule;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * DTO for creating or updating a report schedule
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportScheduleRequest {

    @NotBlank(message = "Report name is required")
    @Size(max = 255, message = "Report name must not exceed 255 characters")
    private String reportName;

    @NotNull(message = "Report type is required")
    private ReportSchedule.ReportType reportType;

    @NotNull(message = "Frequency is required")
    private ReportSchedule.Frequency frequency;

    @Min(value = 1, message = "Day of week must be between 1 (Monday) and 7 (Sunday)")
    @Max(value = 7, message = "Day of week must be between 1 (Monday) and 7 (Sunday)")
    private Integer dayOfWeek; // Required for WEEKLY

    @Min(value = 1, message = "Day of month must be between 1 and 31")
    @Max(value = 31, message = "Day of month must be between 1 and 31")
    private Integer dayOfMonth; // Required for MONTHLY

    @NotNull(message = "Time of day is required")
    private LocalTime timeOfDay;

    @NotNull(message = "Format is required")
    private ReportSchedule.ReportFormat format;

    @Builder.Default
    private Boolean enabled = true;

    private String filters; // JSON string

    private String[] recipientEmails;

    @Builder.Default
    private Boolean includeCharts = false;

    /**
     * Convert request to entity
     */
    public ReportSchedule toEntity(Long userId) {
        return ReportSchedule.builder()
                .userId(userId)
                .reportName(reportName)
                .reportType(reportType)
                .frequency(frequency)
                .dayOfWeek(dayOfWeek)
                .dayOfMonth(dayOfMonth)
                .timeOfDay(timeOfDay)
                .format(format)
                .enabled(enabled != null ? enabled : true)
                .filters(filters)
                .recipientEmails(recipientEmails)
                .includeCharts(includeCharts != null ? includeCharts : false)
                .build();
    }

    /**
     * Validate that day of week is set for weekly schedules
     */
    @AssertTrue(message = "Day of week must be set for weekly schedules")
    private boolean isValidWeeklySchedule() {
        if (frequency == ReportSchedule.Frequency.WEEKLY) {
            return dayOfWeek != null;
        }
        return true;
    }

    /**
     * Validate that day of month is set for monthly schedules
     */
    @AssertTrue(message = "Day of month must be set for monthly schedules")
    private boolean isValidMonthlySchedule() {
        if (frequency == ReportSchedule.Frequency.MONTHLY) {
            return dayOfMonth != null;
        }
        return true;
    }
}
