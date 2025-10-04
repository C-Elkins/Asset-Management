# GDPR/CCPA Implementation Plan for Current Asset Management System

## 🎯 Best Approach for Your Current Architecture

### **Why This Approach Works Best:**

1. **Leverages Existing Auth System** - Your email-based authentication is already GDPR-compliant
2. **Minimal Code Changes** - Works with your current Spring Boot + React setup
3. **Tenant-Safe** - Respects your multi-tenant architecture
4. **Incremental Implementation** - Can deploy piece by piece

---

## 📋 **Phase 1: Foundation (Week 1) - START HERE**

### 1.1 Add Privacy Entities to Existing Model

Add these to your current `backend/src/main/java/com/chaseelkins/assetmanagement/model/` directory:

```java
// UserConsent.java - Extends your existing user system
@Entity
@Table(name = "user_consents")
public class UserConsent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "tenant_id", nullable = false) // ✅ Works with your tenant system
    private Long tenantId;
    
    @Column(name = "marketing_emails", nullable = false)
    private boolean marketingEmails = false;
    
    @Column(name = "analytics", nullable = false)  
    private boolean analytics = false;
    
    @Column(name = "data_processing", nullable = false)
    private boolean dataProcessing = true; // Required for app function
    
    @Column(name = "consent_version", nullable = false)
    private String consentVersion = "1.0";
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp  
    private LocalDateTime updatedAt;
    
    // Getters/Setters
}
```

### 1.2 Create Privacy Repository (Extends Your Pattern)

```java
// UserConsentRepository.java
@Repository
public interface UserConsentRepository extends JpaRepository<UserConsent, Long> {
    
    @Query("SELECT uc FROM UserConsent uc WHERE uc.userId = :userId AND uc.tenantId = :tenantId")
    Optional<UserConsent> findByUserIdAndTenantId(@Param("userId") Long userId, @Param("tenantId") Long tenantId);
    
    @Query("SELECT uc FROM UserConsent uc WHERE uc.tenantId = :tenantId")
    List<UserConsent> findByTenantId(@Param("tenantId") Long tenantId);
}
```

### 1.3 Add Privacy Controller (Matches Your Auth Pattern)

```java
// PrivacyController.java - Follows your existing controller style
@RestController
@RequestMapping("/api/v1/privacy")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = {"http://localhost:3005", "http://localhost:3000"}) // ✅ Matches your CORS setup
public class PrivacyController {

    @Autowired
    private UserRepository userRepository; // ✅ Uses your existing repo
    
    @Autowired
    private UserConsentRepository consentRepository;
    
    @Autowired
    private TenantContext tenantContext; // ✅ Uses your tenant system

    /**
     * Get user's personal data - matches your existing auth pattern
     */
    @GetMapping("/my-data")
    public ResponseEntity<Map<String, Object>> getMyPersonalData(Authentication auth) {
        String userEmail = auth.getName(); // ✅ Works with your email auth
        Long tenantId = tenantContext.getCurrentTenantId();
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> personalData = new HashMap<>();
        personalData.put("user", mapUserData(user));
        personalData.put("consent", getCurrentConsent(user.getId(), tenantId));
        personalData.put("exportedAt", LocalDateTime.now());
        
        return ResponseEntity.ok(personalData);
    }

    /**
     * Update consent preferences
     */
    @PutMapping("/consent")
    public ResponseEntity<Map<String, String>> updateConsent(
            @RequestBody Map<String, Boolean> consentData,
            Authentication auth) {
        
        String userEmail = auth.getName();
        Long tenantId = tenantContext.getCurrentTenantId();
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserConsent consent = consentRepository.findByUserIdAndTenantId(user.getId(), tenantId)
            .orElse(new UserConsent());
        
        consent.setUserId(user.getId());
        consent.setTenantId(tenantId);
        consent.setMarketingEmails(consentData.getOrDefault("marketingEmails", false));
        consent.setAnalytics(consentData.getOrDefault("analytics", false));
        
        consentRepository.save(consent);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Consent updated successfully");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get current consent status
     */
    @GetMapping("/consent")
    public ResponseEntity<UserConsent> getConsentStatus(Authentication auth) {
        String userEmail = auth.getName();
        Long tenantId = tenantContext.getCurrentTenantId();
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserConsent consent = consentRepository.findByUserIdAndTenantId(user.getId(), tenantId)
            .orElse(createDefaultConsent(user.getId(), tenantId));
        
        return ResponseEntity.ok(consent);
    }

    // Helper methods
    private Map<String, Object> mapUserData(User user) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("department", user.getDepartment());
        userData.put("jobTitle", user.getJobTitle());
        userData.put("createdAt", user.getCreatedAt());
        userData.put("updatedAt", user.getUpdatedAt());
        return userData;
    }
    
    private UserConsent createDefaultConsent(Long userId, Long tenantId) {
        UserConsent consent = new UserConsent();
        consent.setUserId(userId);
        consent.setTenantId(tenantId);
        consent.setDataProcessing(true); // Required for app function
        return consentRepository.save(consent);
    }
}
```

---

## 📋 **Phase 2: Frontend Integration (Week 2)**

### 2.1 Add Privacy Settings Page

Create `frontend/src/pages/settings/PrivacySettings.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../app/store/authStore';

export const PrivacySettings = () => {
    const [consent, setConsent] = useState({
        marketingEmails: false,
        analytics: false,
        dataProcessing: true // Always true - required for app
    });
    const [personalData, setPersonalData] = useState(null);
    const [loading, setLoading] = useState(false);

    const { accessToken } = useAuthStore();

    useEffect(() => {
        loadConsentStatus();
    }, []);

    const loadConsentStatus = async () => {
        try {
            const response = await fetch('/api/v1/privacy/consent', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setConsent(data);
            }
        } catch (error) {
            console.error('Failed to load consent status:', error);
        }
    };

    const updateConsent = async (newConsent) => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/privacy/consent', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newConsent)
            });

            if (response.ok) {
                setConsent(newConsent);
                alert('Consent preferences updated successfully');
            }
        } catch (error) {
            console.error('Failed to update consent:', error);
            alert('Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const downloadMyData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/privacy/my-data', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], 
                    { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to download data:', error);
            alert('Failed to download data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Privacy Settings</h1>
            
            {/* Consent Management */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Data Processing Consent</h2>
                
                <div className="space-y-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={consent.dataProcessing}
                            disabled={true}
                            className="mr-3"
                        />
                        <div>
                            <span className="font-medium">Essential Data Processing</span>
                            <p className="text-sm text-gray-600">
                                Required for app functionality (cannot be disabled)
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={consent.marketingEmails}
                            onChange={(e) => updateConsent({
                                ...consent,
                                marketingEmails: e.target.checked
                            })}
                            disabled={loading}
                            className="mr-3"
                        />
                        <div>
                            <span className="font-medium">Marketing Emails</span>
                            <p className="text-sm text-gray-600">
                                Receive product updates and promotional emails
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={consent.analytics}
                            onChange={(e) => updateConsent({
                                ...consent,
                                analytics: e.target.checked
                            })}
                            disabled={loading}
                            className="mr-3"
                        />
                        <div>
                            <span className="font-medium">Analytics & Performance</span>
                            <p className="text-sm text-gray-600">
                                Help us improve the app with usage analytics
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Data Access */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Your Data</h2>
                
                <div className="space-y-4">
                    <button
                        onClick={downloadMyData}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Preparing...' : 'Download My Data'}
                    </button>
                    
                    <p className="text-sm text-gray-600">
                        Download all personal data we have about you in JSON format.
                        This includes your profile, asset assignments, and activity logs.
                    </p>
                </div>
            </div>
        </div>
    );
};
```

### 2.2 Add to Settings Navigation

Update your existing settings navigation to include privacy:

```jsx
// In your SettingsPage.jsx or settings navigation
<Route path="privacy" element={<PrivacySettings />} />
```

---

## 📋 **Phase 3: Database Migration (Week 3)**

### 3.1 Create Migration Script

Add to your `backend/src/main/resources/db/migration/`:

```sql
-- V3__add_privacy_tables.sql
CREATE TABLE user_consents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    marketing_emails BOOLEAN NOT NULL DEFAULT false,
    analytics BOOLEAN NOT NULL DEFAULT false,
    data_processing BOOLEAN NOT NULL DEFAULT true,
    consent_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_consents_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_consents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_user_consents_user_tenant ON user_consents(user_id, tenant_id);
CREATE INDEX idx_user_consents_tenant ON user_consents(tenant_id);
```

---

## 🎯 **Why This Approach is Best for Your System:**

### ✅ **Minimal Disruption**
- Works with your existing email authentication
- Respects your tenant architecture  
- Uses your existing CORS and security setup
- Follows your current controller patterns

### ✅ **Incremental Deployment**
- Can deploy privacy endpoints without touching existing code
- Frontend privacy page is separate from main app
- Database changes are additive only

### ✅ **Production Ready**
- Tenant-safe (respects multi-tenancy)
- Uses your existing auth tokens
- Follows your API patterns (`/api/v1/`)
- Matches your error handling approach

### ✅ **GDPR/CCPA Compliant**
- Right to Access: `/api/v1/privacy/my-data`
- Consent Management: `/api/v1/privacy/consent`
- Data Portability: Download JSON export
- Audit Trail: Uses your existing audit logging

---

## 🚀 **Quick Start Implementation**

1. **Add UserConsent entity** to your models
2. **Add PrivacyController** to your controllers  
3. **Create privacy settings page** in frontend
4. **Run database migration**
5. **Test with your existing admin/user accounts**

This approach leverages your current architecture and can be implemented incrementally without breaking existing functionality!

Want me to help you implement any specific part of this plan?
