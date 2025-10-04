package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.CreateReportScheduleRequest;
import com.chaseelkins.assetmanagement.dto.ReportScheduleDto;
import com.chaseelkins.assetmanagement.model.ReportSchedule;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.ReportScheduleRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportScheduleService {

    private final ReportScheduleRepository reportScheduleRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportScheduleDto createSchedule(CreateReportScheduleRequest request) {
        User user = getCurrentUser();
        ReportSchedule schedule = request.toEntity(user.getId());
        ReportSchedule saved = reportScheduleRepository.save(schedule);
        
        log.info("Created report schedule {} for user {}", saved.getId(), user.getEmail());
        return ReportScheduleDto.fromEntity(saved);
    }

    public List<ReportScheduleDto> getUserSchedules() {
        User user = getCurrentUser();
        List<ReportSchedule> schedules = reportScheduleRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        return schedules.stream()
                .map(ReportScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ReportScheduleDto getScheduleById(Long id) {
        ReportSchedule schedule = findScheduleById(id);
        User user = getCurrentUser();
        
        if (!schedule.getUserId().equals(user.getId()) && !isAdmin()) {
            throw new RuntimeException("You do not have permission to view this schedule");
        }
        
        return ReportScheduleDto.fromEntity(schedule);
    }

    @Transactional
    public ReportScheduleDto updateSchedule(Long id, CreateReportScheduleRequest request) {
        ReportSchedule schedule = findScheduleById(id);
        User user = getCurrentUser();
        
        if (!schedule.getUserId().equals(user.getId()) && !isAdmin()) {
            throw new RuntimeException("You do not have permission to update this schedule");
        }
        
        schedule.setReportName(request.getReportName());
        schedule.setReportType(request.getReportType());
        schedule.setFrequency(request.getFrequency());
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setDayOfMonth(request.getDayOfMonth());
        schedule.setTimeOfDay(request.getTimeOfDay());
        schedule.setFormat(request.getFormat());
        schedule.setEnabled(request.getEnabled());
        schedule.setFilters(request.getFilters());
        schedule.setRecipientEmails(request.getRecipientEmails());
        schedule.setIncludeCharts(request.getIncludeCharts());
        schedule.calculateNextRun();
        
        ReportSchedule updated = reportScheduleRepository.save(schedule);
        log.info("Updated report schedule {}", id);
        
        return ReportScheduleDto.fromEntity(updated);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        ReportSchedule schedule = findScheduleById(id);
        User user = getCurrentUser();
        
        if (!schedule.getUserId().equals(user.getId()) && !isAdmin()) {
            throw new RuntimeException("You do not have permission to delete this schedule");
        }
        
        reportScheduleRepository.delete(schedule);
        log.info("Deleted report schedule {}", id);
    }

    @Transactional
    public ReportScheduleDto toggleEnabled(Long id) {
        ReportSchedule schedule = findScheduleById(id);
        User user = getCurrentUser();
        
        if (!schedule.getUserId().equals(user.getId()) && !isAdmin()) {
            throw new RuntimeException("You do not have permission to modify this schedule");
        }
        
        schedule.setEnabled(!schedule.getEnabled());
        if (schedule.getEnabled()) {
            schedule.calculateNextRun();
        }
        
        ReportSchedule updated = reportScheduleRepository.save(schedule);
        log.info("Toggled schedule {} enabled status to {}", id, updated.getEnabled());
        
        return ReportScheduleDto.fromEntity(updated);
    }

    public List<ReportSchedule> getDueSchedules() {
        return reportScheduleRepository.findDueSchedules(LocalDateTime.now());
    }

    @Transactional
    public void markAsExecuted(Long scheduleId) {
        ReportSchedule schedule = findScheduleById(scheduleId);
        schedule.markAsExecuted();
        reportScheduleRepository.save(schedule);
        
        log.info("Marked schedule {} as executed. Next run: {}", scheduleId, schedule.getNextRunAt());
    }

    private ReportSchedule findScheduleById(Long id) {
        return reportScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report schedule not found with id: " + id));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_IT_ADMIN") || 
                                 auth.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }
}
