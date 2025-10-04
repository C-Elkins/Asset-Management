package com.chaseelkins.assetmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entity representing a scheduled report configuration
 * Supports automated report generation and delivery via email
 */
@Entity
@Table(name = "report_schedules", indexes = {
    @Index(name = "idx_report_schedules_tenant", columnList = "tenant_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSchedule extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "report_name", nullable = false, length = 255)
    private String reportName;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 50)
    private ReportType reportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false, length = 20)
    private Frequency frequency;

    @Column(name = "day_of_week")
    private Integer dayOfWeek; // 1=Monday, 7=Sunday

    @Column(name = "day_of_month")
    private Integer dayOfMonth; // 1-31

    @Builder.Default
    @Column(name = "time_of_day", nullable = false)
    private LocalTime timeOfDay = LocalTime.of(9, 0);

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "format", nullable = false, length = 10)
    private ReportFormat format = ReportFormat.CSV;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "filters", columnDefinition = "jsonb")
    private String filters; // JSON string

    @Column(name = "recipient_emails")
    private String[] recipientEmails;

    @Builder.Default
    @Column(name = "include_charts")
    private Boolean includeCharts = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_run_at")
    private LocalDateTime lastRunAt;

    @Column(name = "next_run_at")
    private LocalDateTime nextRunAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        calculateNextRun();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Calculate the next run time based on frequency and current time
     */
    public void calculateNextRun() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextRun;

        switch (frequency) {
            case DAILY:
                nextRun = LocalDateTime.of(now.toLocalDate(), timeOfDay);
                if (nextRun.isBefore(now)) {
                    nextRun = nextRun.plusDays(1);
                }
                break;

            case WEEKLY:
                if (dayOfWeek == null) {
                    throw new IllegalStateException("Day of week must be set for weekly reports");
                }
                nextRun = LocalDateTime.of(now.toLocalDate(), timeOfDay);
                while (nextRun.getDayOfWeek().getValue() != dayOfWeek || nextRun.isBefore(now)) {
                    nextRun = nextRun.plusDays(1);
                }
                break;

            case MONTHLY:
                if (dayOfMonth == null) {
                    throw new IllegalStateException("Day of month must be set for monthly reports");
                }
                nextRun = LocalDateTime.of(now.toLocalDate().withDayOfMonth(1), timeOfDay)
                        .withDayOfMonth(Math.min(dayOfMonth, now.toLocalDate().lengthOfMonth()));
                if (nextRun.isBefore(now)) {
                    nextRun = nextRun.plusMonths(1)
                            .withDayOfMonth(Math.min(dayOfMonth, nextRun.toLocalDate().lengthOfMonth()));
                }
                break;

            default:
                throw new IllegalStateException("Unknown frequency: " + frequency);
        }

        this.nextRunAt = nextRun;
    }

    /**
     * Mark the report as executed and calculate next run time
     */
    public void markAsExecuted() {
        this.lastRunAt = LocalDateTime.now();
        calculateNextRun();
    }

    public enum ReportType {
        ASSET_LIST("Complete Asset List"),
        MAINTENANCE_DUE("Maintenance Due Soon"),
        WARRANTY_EXPIRING("Warranty Expiring Soon"),
        ASSET_SUMMARY("Asset Summary Report"),
        CUSTOM("Custom Report");

        private final String displayName;

        ReportType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum Frequency {
        DAILY("Daily"),
        WEEKLY("Weekly"),
        MONTHLY("Monthly");

        private final String displayName;

        Frequency(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum ReportFormat {
        CSV("CSV"),
        PDF("PDF");

        private final String displayName;

        ReportFormat(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
