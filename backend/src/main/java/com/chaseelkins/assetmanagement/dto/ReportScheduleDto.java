package com.chaseelkins.assetmanagement.dto;

import com.chaseelkins.assetmanagement.model.ReportSchedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for ReportSchedule responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportScheduleDto {
    private Long id;
    private Long userId;
    private String reportName;
    private ReportSchedule.ReportType reportType;
    private ReportSchedule.Frequency frequency;
    private Integer dayOfWeek;
    private Integer dayOfMonth;
    private LocalTime timeOfDay;
    private ReportSchedule.ReportFormat format;
    private Boolean enabled;
    private String filters;
    private String[] recipientEmails;
    private Boolean includeCharts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastRunAt;
    private LocalDateTime nextRunAt;

    /**
     * Convert entity to DTO
     */
    public static ReportScheduleDto fromEntity(ReportSchedule entity) {
        return ReportScheduleDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .reportName(entity.getReportName())
                .reportType(entity.getReportType())
                .frequency(entity.getFrequency())
                .dayOfWeek(entity.getDayOfWeek())
                .dayOfMonth(entity.getDayOfMonth())
                .timeOfDay(entity.getTimeOfDay())
                .format(entity.getFormat())
                .enabled(entity.getEnabled())
                .filters(entity.getFilters())
                .recipientEmails(entity.getRecipientEmails())
                .includeCharts(entity.getIncludeCharts())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .lastRunAt(entity.getLastRunAt())
                .nextRunAt(entity.getNextRunAt())
                .build();
    }
}
