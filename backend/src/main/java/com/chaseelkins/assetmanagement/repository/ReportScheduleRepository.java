package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.ReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for managing scheduled reports
 */
@Repository
public interface ReportScheduleRepository extends JpaRepository<ReportSchedule, Long> {

    /**
     * Find all schedules for a specific user
     *
     * @param userId the user ID
     * @return list of report schedules
     */
    List<ReportSchedule> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all enabled schedules that are due to run
     *
     * @param now current timestamp
     * @return list of schedules due to run
     */
    @Query("SELECT rs FROM ReportSchedule rs WHERE rs.enabled = true AND rs.nextRunAt <= :now")
    List<ReportSchedule> findDueSchedules(LocalDateTime now);

    /**
     * Find all enabled schedules
     *
     * @return list of enabled schedules
     */
    List<ReportSchedule> findByEnabledTrue();

    /**
     * Count schedules for a user
     *
     * @param userId the user ID
     * @return number of schedules
     */
    long countByUserId(Long userId);

    /**
     * Find schedules by type for a user
     *
     * @param userId the user ID
     * @param reportType the report type
     * @return list of matching schedules
     */
    List<ReportSchedule> findByUserIdAndReportType(Long userId, ReportSchedule.ReportType reportType);
}
