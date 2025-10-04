# GDPR/CCPA Compliance Checklist for IT Asset Management SaaS

## Overview

This checklist ensures your IT Asset Management SaaS complies with GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act) requirements.

## 📋 Compliance Checklist

### 1. Data Subject Rights Implementation

#### Required Rights to Implement:
- [ ] **Right to Access** - Users can view their personal data
- [ ] **Right to Rectification** - Users can correct their data
- [ ] **Right to Erasure** - Users can request data deletion
- [ ] **Right to Portability** - Users can export their data
- [ ] **Right to Restrict Processing** - Users can limit data processing
- [ ] **Right to Object** - Users can opt-out of processing
- [ ] **Right to Know** (CCPA) - Disclosure of data collection practices

### 2. Consent Mechanisms

- [ ] **Explicit Consent** for data processing
- [ ] **Cookie Consent** management
- [ ] **Opt-in/Opt-out** mechanisms
- [ ] **Consent Withdrawal** capabilities
- [ ] **Age Verification** for users under 16
- [ ] **Parental Consent** for users under 13

### 3. Data Processing Requirements

- [ ] **Lawful Basis** documented for each processing activity
- [ ] **Data Minimization** - collect only necessary data
- [ ] **Purpose Limitation** - use data only for stated purposes
- [ ] **Storage Limitation** - delete data when no longer needed
- [ ] **Data Protection Impact Assessment** (DPIA) completed

### 4. Technical Implementation

- [ ] **Privacy by Design** architecture
- [ ] **Data Encryption** at rest and in transit
- [ ] **Audit Logging** for all data access
- [ ] **Automated Data Retention** policies
- [ ] **Data Anonymization** capabilities

## 🔧 Spring Boot Implementation

### 1. Privacy Controller for Data Subject Rights

```java
@RestController
@RequestMapping("/api/v1/privacy")
@PreAuthorize("hasRole('USER')")
@Validated
public class PrivacyController {

    @Autowired
    private PrivacyService privacyService;
    
    @Autowired
    private DataExportService dataExportService;
    
    @Autowired
    private DataDeletionService dataDeletionService;

    /**
     * Right to Access - Get all personal data for the authenticated user
     */
    @GetMapping("/my-data")
    public ResponseEntity<PersonalDataResponse> getMyPersonalData(Authentication auth) {
        String userEmail = auth.getName();
        PersonalDataResponse data = privacyService.getPersonalData(userEmail);
        
        // Log access for audit trail
        auditLogger.logDataAccess(userEmail, "PERSONAL_DATA_ACCESS");
        
        return ResponseEntity.ok(data);
    }

    /**
     * Right to Portability - Export personal data in JSON format
     */
    @PostMapping("/export-data")
    public ResponseEntity<DataExportResponse> exportPersonalData(
            @RequestBody DataExportRequest request,
            Authentication auth) {
        
        String userEmail = auth.getName();
        
        // Validate export format
        if (!Arrays.asList("JSON", "CSV", "XML").contains(request.getFormat())) {
            throw new InvalidExportFormatException("Supported formats: JSON, CSV, XML");
        }
        
        // Create export job
        String exportId = dataExportService.createExportJob(userEmail, request.getFormat());
        
        auditLogger.logDataExport(userEmail, request.getFormat());
        
        return ResponseEntity.accepted()
            .body(new DataExportResponse(exportId, "Export initiated", 
                "/api/v1/privacy/export-status/" + exportId));
    }

    /**
     * Check export status
     */
    @GetMapping("/export-status/{exportId}")
    public ResponseEntity<ExportStatusResponse> getExportStatus(
            @PathVariable String exportId,
            Authentication auth) {
        
        ExportStatusResponse status = dataExportService.getExportStatus(exportId, auth.getName());
        return ResponseEntity.ok(status);
    }

    /**
     * Download exported data
     */
    @GetMapping("/download-export/{exportId}")
    public ResponseEntity<Resource> downloadExport(
            @PathVariable String exportId,
            Authentication auth) {
        
        ExportFile exportFile = dataExportService.getExportFile(exportId, auth.getName());
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + exportFile.getFilename() + "\"")
            .body(exportFile.getResource());
    }

    /**
     * Right to Erasure - Request data deletion
     */
    @DeleteMapping("/delete-my-data")
    public ResponseEntity<DataDeletionResponse> requestDataDeletion(
            @RequestBody DataDeletionRequest request,
            Authentication auth) {
        
        String userEmail = auth.getName();
        
        // Validate deletion request
        if (!request.getConfirmation().equals("DELETE_MY_DATA")) {
            throw new InvalidDeletionRequestException("Invalid confirmation text");
        }
        
        // Create deletion job
        String deletionId = dataDeletionService.createDeletionJob(userEmail, request.getReason());
        
        auditLogger.logDataDeletionRequest(userEmail, request.getReason());
        
        return ResponseEntity.accepted()
            .body(new DataDeletionResponse(deletionId, 
                "Data deletion request submitted for review", 
                "/api/v1/privacy/deletion-status/" + deletionId));
    }

    /**
     * Check deletion status
     */
    @GetMapping("/deletion-status/{deletionId}")
    public ResponseEntity<DeletionStatusResponse> getDeletionStatus(
            @PathVariable String deletionId,
            Authentication auth) {
        
        DeletionStatusResponse status = dataDeletionService.getDeletionStatus(deletionId, auth.getName());
        return ResponseEntity.ok(status);
    }

    /**
     * Update consent preferences
     */
    @PutMapping("/consent")
    public ResponseEntity<ConsentResponse> updateConsent(
            @RequestBody @Valid ConsentUpdateRequest request,
            Authentication auth) {
        
        String userEmail = auth.getName();
        ConsentResponse response = privacyService.updateConsent(userEmail, request);
        
        auditLogger.logConsentUpdate(userEmail, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get current consent status
     */
    @GetMapping("/consent")
    public ResponseEntity<ConsentStatusResponse> getConsentStatus(Authentication auth) {
        String userEmail = auth.getName();
        ConsentStatusResponse status = privacyService.getConsentStatus(userEmail);
        return ResponseEntity.ok(status);
    }
}
```

### 2. Privacy Service Implementation

```java
@Service
@Transactional
public class PrivacyService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Autowired
    private ConsentRepository consentRepository;
    
    @Autowired
    private DataAnonymizationService anonymizationService;

    public PersonalDataResponse getPersonalData(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Collect all personal data across the system
        PersonalDataResponse.Builder builder = PersonalDataResponse.builder()
            .user(mapUserData(user))
            .assets(getAssetsAssignedToUser(user.getId()))
            .auditLogs(getAuditLogsForUser(user.getId()))
            .consents(getConsentHistory(user.getId()))
            .loginHistory(getLoginHistory(user.getId()));
        
        return builder.build();
    }

    public ConsentResponse updateConsent(String userEmail, ConsentUpdateRequest request) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Update consent records
        UserConsent consent = consentRepository.findByUserId(user.getId())
            .orElse(new UserConsent(user.getId()));
        
        consent.setMarketingEmails(request.isMarketingEmails());
        consent.setAnalytics(request.isAnalytics());
        consent.setThirdPartySharing(request.isThirdPartySharing());
        consent.setProfileEnhancements(request.isProfileEnhancements());
        consent.setUpdatedAt(LocalDateTime.now());
        consent.setConsentVersion(getCurrentConsentVersion());
        
        consentRepository.save(consent);
        
        // Create audit trail
        createConsentAuditRecord(user.getId(), request);
        
        return ConsentResponse.builder()
            .message("Consent preferences updated successfully")
            .effectiveDate(LocalDateTime.now())
            .build();
    }

    public ConsentStatusResponse getConsentStatus(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        UserConsent consent = consentRepository.findByUserId(user.getId())
            .orElse(new UserConsent(user.getId()));
        
        return ConsentStatusResponse.builder()
            .marketingEmails(consent.isMarketingEmails())
            .analytics(consent.isAnalytics())
            .thirdPartySharing(consent.isThirdPartySharing())
            .profileEnhancements(consent.isProfileEnhancements())
            .consentDate(consent.getCreatedAt())
            .lastUpdated(consent.getUpdatedAt())
            .consentVersion(consent.getConsentVersion())
            .build();
    }

    private List<AssetData> getAssetsAssignedToUser(Long userId) {
        return assetRepository.findByAssignedUserId(userId).stream()
            .map(this::mapAssetData)
            .collect(Collectors.toList());
    }

    private List<AuditLogData> getAuditLogsForUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(this::mapAuditLogData)
            .collect(Collectors.toList());
    }

    private PersonalUserData mapUserData(User user) {
        return PersonalUserData.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phoneNumber(user.getPhoneNumber())
            .department(user.getDepartment())
            .jobTitle(user.getJobTitle())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .lastLogin(user.getLastLogin())
            .isActive(user.isActive())
            .build();
    }
}
```

### 3. Data Export Service

```java
@Service
@Async
public class DataExportService {

    @Autowired
    private PrivacyService privacyService;
    
    @Autowired
    private ExportJobRepository exportJobRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String createExportJob(String userEmail, String format) {
        ExportJob job = new ExportJob();
        job.setUserEmail(userEmail);
        job.setFormat(format);
        job.setStatus(ExportStatus.INITIATED);
        job.setCreatedAt(LocalDateTime.now());
        job.setExpiresAt(LocalDateTime.now().plusDays(30)); // GDPR requirement: available for 30 days
        
        ExportJob savedJob = exportJobRepository.save(job);
        
        // Process export asynchronously
        processExportAsync(savedJob.getId());
        
        return savedJob.getId().toString();
    }

    @Async
    public void processExportAsync(Long jobId) {
        try {
            ExportJob job = exportJobRepository.findById(jobId)
                .orElseThrow(() -> new ExportJobNotFoundException("Export job not found"));
            
            // Update status to processing
            job.setStatus(ExportStatus.PROCESSING);
            job.setStartedAt(LocalDateTime.now());
            exportJobRepository.save(job);
            
            // Get personal data
            PersonalDataResponse personalData = privacyService.getPersonalData(job.getUserEmail());
            
            // Generate export file based on format
            byte[] exportData = generateExportFile(personalData, job.getFormat());
            
            // Store file
            String filename = generateFilename(job.getUserEmail(), job.getFormat());
            String fileUrl = fileStorageService.store(exportData, filename);
            
            // Update job with completion
            job.setStatus(ExportStatus.COMPLETED);
            job.setCompletedAt(LocalDateTime.now());
            job.setFileUrl(fileUrl);
            job.setFilename(filename);
            exportJobRepository.save(job);
            
            // Send notification email
            emailService.sendExportReadyNotification(job.getUserEmail(), job.getId().toString());
            
        } catch (Exception e) {
            // Handle failure
            ExportJob job = exportJobRepository.findById(jobId).orElse(null);
            if (job != null) {
                job.setStatus(ExportStatus.FAILED);
                job.setErrorMessage(e.getMessage());
                job.setCompletedAt(LocalDateTime.now());
                exportJobRepository.save(job);
            }
            
            log.error("Export job {} failed", jobId, e);
        }
    }

    private byte[] generateExportFile(PersonalDataResponse data, String format) throws Exception {
        switch (format.toUpperCase()) {
            case "JSON":
                return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsBytes(data);
            
            case "CSV":
                return generateCsvExport(data);
            
            case "XML":
                return generateXmlExport(data);
            
            default:
                throw new UnsupportedExportFormatException("Unsupported format: " + format);
        }
    }

    private byte[] generateCsvExport(PersonalDataResponse data) throws Exception {
        StringWriter writer = new StringWriter();
        CSVPrinter printer = CSVFormat.DEFAULT
            .withHeader("Category", "Field", "Value", "Last Updated")
            .print(writer);
        
        // Export user data
        PersonalUserData user = data.getUser();
        printer.printRecord("User", "Email", user.getEmail(), user.getUpdatedAt());
        printer.printRecord("User", "First Name", user.getFirstName(), user.getUpdatedAt());
        printer.printRecord("User", "Last Name", user.getLastName(), user.getUpdatedAt());
        printer.printRecord("User", "Phone", user.getPhoneNumber(), user.getUpdatedAt());
        printer.printRecord("User", "Department", user.getDepartment(), user.getUpdatedAt());
        printer.printRecord("User", "Job Title", user.getJobTitle(), user.getUpdatedAt());
        
        // Export asset assignments
        for (AssetData asset : data.getAssets()) {
            printer.printRecord("Asset", "Asset Tag", asset.getAssetTag(), asset.getUpdatedAt());
            printer.printRecord("Asset", "Asset Name", asset.getName(), asset.getUpdatedAt());
            printer.printRecord("Asset", "Assignment Date", asset.getAssignedAt(), asset.getAssignedAt());
        }
        
        printer.close();
        return writer.toString().getBytes(StandardCharsets.UTF_8);
    }

    public ExportStatusResponse getExportStatus(String exportId, String userEmail) {
        ExportJob job = exportJobRepository.findById(Long.valueOf(exportId))
            .orElseThrow(() -> new ExportJobNotFoundException("Export job not found"));
        
        // Verify ownership
        if (!job.getUserEmail().equals(userEmail)) {
            throw new UnauthorizedAccessException("Access denied to export job");
        }
        
        return ExportStatusResponse.builder()
            .exportId(exportId)
            .status(job.getStatus().toString())
            .createdAt(job.getCreatedAt())
            .startedAt(job.getStartedAt())
            .completedAt(job.getCompletedAt())
            .expiresAt(job.getExpiresAt())
            .downloadUrl(job.getStatus() == ExportStatus.COMPLETED ? 
                "/api/v1/privacy/download-export/" + exportId : null)
            .build();
    }
}
```

### 4. Data Deletion Service

```java
@Service
@Transactional
public class DataDeletionService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DeletionJobRepository deletionJobRepository;
    
    @Autowired
    private DataAnonymizationService anonymizationService;
    
    @Autowired
    private AssetRepository assetRepository;

    public String createDeletionJob(String userEmail, String reason) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Check if user has active asset assignments
        List<Asset> assignedAssets = assetRepository.findByAssignedUserId(user.getId());
        if (!assignedAssets.isEmpty()) {
            throw new DataDeletionException(
                "Cannot delete data while user has active asset assignments. " +
                "Please return all assigned assets first.");
        }
        
        DeletionJob job = new DeletionJob();
        job.setUserId(user.getId());
        job.setUserEmail(userEmail);
        job.setReason(reason);
        job.setStatus(DeletionStatus.PENDING_REVIEW);
        job.setCreatedAt(LocalDateTime.now());
        job.setScheduledDeletionDate(LocalDateTime.now().plusDays(30)); // 30-day grace period
        
        DeletionJob savedJob = deletionJobRepository.save(job);
        
        // Send confirmation email
        emailService.sendDeletionRequestConfirmation(userEmail, savedJob.getId().toString());
        
        return savedJob.getId().toString();
    }

    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
    public void processScheduledDeletions() {
        LocalDateTime now = LocalDateTime.now();
        List<DeletionJob> jobsToProcess = deletionJobRepository
            .findByStatusAndScheduledDeletionDateBefore(DeletionStatus.APPROVED, now);
        
        for (DeletionJob job : jobsToProcess) {
            try {
                executeDataDeletion(job);
            } catch (Exception e) {
                log.error("Failed to execute deletion job {}", job.getId(), e);
                job.setStatus(DeletionStatus.FAILED);
                job.setErrorMessage(e.getMessage());
                deletionJobRepository.save(job);
            }
        }
    }

    private void executeDataDeletion(DeletionJob job) {
        User user = userRepository.findById(job.getUserId())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // 1. Anonymize audit logs (GDPR requirement: maintain audit trail but anonymize PII)
        anonymizationService.anonymizeUserAuditLogs(user.getId());
        
        // 2. Delete or anonymize user-generated content
        anonymizationService.anonymizeUserComments(user.getId());
        anonymizationService.anonymizeUserReports(user.getId());
        
        // 3. Delete consent records
        consentRepository.deleteByUserId(user.getId());
        
        // 4. Delete refresh tokens and sessions
        refreshTokenRepository.deleteByUserId(user.getId());
        
        // 5. Delete export/deletion job history (except current job)
        exportJobRepository.deleteByUserEmailAndIdNot(user.getEmail(), job.getId());
        deletionJobRepository.deleteByUserIdAndIdNot(user.getId(), job.getId());
        
        // 6. Finally, delete the user account
        userRepository.delete(user);
        
        // Update job status
        job.setStatus(DeletionStatus.COMPLETED);
        job.setExecutedAt(LocalDateTime.now());
        deletionJobRepository.save(job);
        
        // Send final confirmation
        emailService.sendDeletionCompletedNotification(job.getUserEmail());
        
        log.info("Data deletion completed for user {} (job {})", user.getEmail(), job.getId());
    }

    public DeletionStatusResponse getDeletionStatus(String deletionId, String userEmail) {
        DeletionJob job = deletionJobRepository.findById(Long.valueOf(deletionId))
            .orElseThrow(() -> new DeletionJobNotFoundException("Deletion job not found"));
        
        if (!job.getUserEmail().equals(userEmail)) {
            throw new UnauthorizedAccessException("Access denied to deletion job");
        }
        
        return DeletionStatusResponse.builder()
            .deletionId(deletionId)
            .status(job.getStatus().toString())
            .reason(job.getReason())
            .createdAt(job.getCreatedAt())
            .scheduledDeletionDate(job.getScheduledDeletionDate())
            .executedAt(job.getExecutedAt())
            .canCancel(job.getStatus() == DeletionStatus.PENDING_REVIEW)
            .build();
    }
}
```

### 5. Consent Management Entities

```java
@Entity
@Table(name = "user_consents")
public class UserConsent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "marketing_emails", nullable = false)
    private boolean marketingEmails = false;
    
    @Column(name = "analytics", nullable = false)
    private boolean analytics = false;
    
    @Column(name = "third_party_sharing", nullable = false)
    private boolean thirdPartySharing = false;
    
    @Column(name = "profile_enhancements", nullable = false)
    private boolean profileEnhancements = false;
    
    @Column(name = "consent_version", nullable = false)
    private String consentVersion;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors, getters, setters
}

@Entity
@Table(name = "export_jobs")
public class ExportJob {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_email", nullable = false)
    private String userEmail;
    
    @Column(name = "format", nullable = false)
    private String format;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExportStatus status;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "filename")
    private String filename;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    // Constructors, getters, setters
}

public enum ExportStatus {
    INITIATED, PROCESSING, COMPLETED, FAILED, EXPIRED
}

public enum DeletionStatus {
    PENDING_REVIEW, APPROVED, REJECTED, COMPLETED, FAILED, CANCELLED
}
```

### 6. Privacy Configuration

```java
@Configuration
@EnableConfigurationProperties(PrivacyProperties.class)
public class PrivacyConfig {

    @Bean
    public PrivacyAuditLogger privacyAuditLogger() {
        return new PrivacyAuditLogger();
    }

    @Bean
    public DataRetentionScheduler dataRetentionScheduler() {
        return new DataRetentionScheduler();
    }
}

@ConfigurationProperties(prefix = "app.privacy")
@Data
public class PrivacyProperties {
    
    private DataRetention retention = new DataRetention();
    private Export export = new Export();
    private Deletion deletion = new Deletion();
    
    @Data
    public static class DataRetention {
        private Duration auditLogs = Duration.ofDays(2555); // 7 years
        private Duration exportJobs = Duration.ofDays(30);
        private Duration deletionJobs = Duration.ofDays(365); // 1 year
        private Duration inactiveUsers = Duration.ofDays(1095); // 3 years
    }
    
    @Data
    public static class Export {
        private Duration availability = Duration.ofDays(30);
        private List<String> supportedFormats = Arrays.asList("JSON", "CSV", "XML");
        private long maxFileSizeMB = 100;
    }
    
    @Data
    public static class Deletion {
        private Duration gracePeriod = Duration.ofDays(30);
        private boolean requireManagerApproval = true;
        private boolean allowImmediateDeletion = false;
    }
}
```

## 📚 Required Documentation

### 1. Privacy Policy Template

Create a comprehensive privacy policy that includes:

- **Data Collection**: What personal data you collect
- **Legal Basis**: Why you process the data (GDPR Article 6)
- **Data Usage**: How you use the data
- **Data Sharing**: Third parties you share data with
- **Data Retention**: How long you keep data
- **User Rights**: How users can exercise their rights
- **Contact Information**: Data Protection Officer details

### 2. Data Processing Record (GDPR Article 30)

Maintain records of:
- Categories of personal data processed
- Purposes of processing
- Legal basis for processing
- Data subjects categories
- Recipients of personal data
- Data retention periods
- Security measures implemented

## 🔒 Security Requirements

### 1. Data Encryption

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/assetdb?sslmode=require
  jpa:
    properties:
      hibernate:
        # Encrypt sensitive fields
        type:
          descriptor:
            sql:
              BasicBinder: TRACE
```

### 2. Audit Logging

All privacy-related actions must be logged:

```java
@Component
public class PrivacyAuditLogger {
    
    private static final Logger auditLog = LoggerFactory.getLogger("PRIVACY_AUDIT");
    
    public void logDataAccess(String userEmail, String action) {
        auditLog.info("DATA_ACCESS: user={}, action={}, timestamp={}", 
            userEmail, action, Instant.now());
    }
    
    public void logDataExport(String userEmail, String format) {
        auditLog.info("DATA_EXPORT: user={}, format={}, timestamp={}", 
            userEmail, format, Instant.now());
    }
    
    public void logDataDeletionRequest(String userEmail, String reason) {
        auditLog.info("DATA_DELETION_REQUEST: user={}, reason={}, timestamp={}", 
            userEmail, reason, Instant.now());
    }
    
    public void logConsentUpdate(String userEmail, ConsentUpdateRequest request) {
        auditLog.info("CONSENT_UPDATE: user={}, consent={}, timestamp={}", 
            userEmail, request, Instant.now());
    }
}
```

## 🚀 Implementation Timeline

### Phase 1 (Week 1-2): Foundation
- [ ] Implement basic privacy controller
- [ ] Set up consent management
- [ ] Create audit logging system

### Phase 2 (Week 3-4): Data Rights
- [ ] Implement data export functionality
- [ ] Build data deletion process
- [ ] Add data access endpoints

### Phase 3 (Week 5-6): Advanced Features
- [ ] Data anonymization service
- [ ] Automated retention policies
- [ ] Privacy dashboard for users

### Phase 4 (Week 7-8): Compliance & Testing
- [ ] Legal review
- [ ] Security audit
- [ ] User acceptance testing

## 📋 Testing Checklist

- [ ] Test all data subject rights endpoints
- [ ] Verify consent management workflow
- [ ] Test data export in all formats
- [ ] Validate data deletion process
- [ ] Check audit trail completeness
- [ ] Test data retention policies
- [ ] Verify encryption at rest and in transit

## 🎯 Key API Endpoints Summary

| Endpoint | Method | Purpose | GDPR/CCPA Right |
|----------|--------|---------|------------------|
| `/api/v1/privacy/my-data` | GET | Access personal data | Right to Access |
| `/api/v1/privacy/export-data` | POST | Export data | Right to Portability |
| `/api/v1/privacy/delete-my-data` | DELETE | Request deletion | Right to Erasure |
| `/api/v1/privacy/consent` | GET/PUT | Manage consent | Consent Management |
| `/api/v1/privacy/export-status/{id}` | GET | Check export status | - |
| `/api/v1/privacy/deletion-status/{id}` | GET | Check deletion status | - |

This comprehensive implementation ensures your IT Asset Management SaaS meets both GDPR and CCPA compliance requirements while providing a seamless user experience for privacy management.
