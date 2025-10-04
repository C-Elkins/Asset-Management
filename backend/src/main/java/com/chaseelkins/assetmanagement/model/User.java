package com.chaseelkins.assetmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_tenant", columnList = "tenant_id"),
    @Index(name = "idx_users_username", columnList = "username"),
    @Index(name = "idx_users_email", columnList = "email")
})
@EntityListeners(AuditingEntityListener.class)
public class User extends TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(unique = true, nullable = false)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    private String email;
    
    // Password is nullable for OAuth2 users
    @Size(min = 12, message = "Password must be at least 12 characters")
    @Column(nullable = true)
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;
    
    @Size(max = 100, message = "Job title cannot exceed 100 characters")
    @Column(name = "job_title")
    private String jobTitle;
    
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    

    @Column(nullable = false)
    private Boolean active = true;

    // Require user to change password on next login (first login or after admin reset)
    @Column(name = "must_change_password", nullable = false)
    private Boolean mustChangePassword = false;
    
    // OAuth2 fields
    @Column(name = "google_id", unique = true)
    private String googleId;
    
    @Column(name = "microsoft_id", unique = true)
    private String microsoftId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    private AuthProvider authProvider = AuthProvider.LOCAL;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Many-to-many relationship with assets (for assignment)
    @ManyToMany(mappedBy = "assignedUsers", fetch = FetchType.LAZY)
    @JsonBackReference(value = "asset-assignment")
    private Set<Asset> assignedAssets = new HashSet<>();
    
    // Constructors
    public User() {}
    

    public User(String username, String email, String password, String firstName, String lastName,
                String department, String jobTitle, String phoneNumber, Role role, Boolean active, Boolean mustChangePassword) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.jobTitle = jobTitle;
        this.phoneNumber = phoneNumber;
        this.role = role != null ? role : Role.USER;
        this.active = active != null ? active : true;
        this.mustChangePassword = mustChangePassword != null ? mustChangePassword : false;
    }
    public Boolean getMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(Boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getJobTitle() {
        return jobTitle;
    }
    
    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Set<Asset> getAssignedAssets() {
        return assignedAssets;
    }
    
    public void setAssignedAssets(Set<Asset> assignedAssets) {
        this.assignedAssets = assignedAssets;
    }
    
    public String getGoogleId() {
        return googleId;
    }
    
    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }
    
    public String getMicrosoftId() {
        return microsoftId;
    }
    
    public void setMicrosoftId(String microsoftId) {
        this.microsoftId = microsoftId;
    }
    
    public AuthProvider getAuthProvider() {
        return authProvider;
    }
    
    public void setAuthProvider(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }
    
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
    
    // Enums
    public enum Role {
        USER,           // Regular employee
        IT_ADMIN,       // IT department admin
        MANAGER,        // Department manager
        SUPER_ADMIN     // System administrator
    }
    
    public enum AuthProvider {
        LOCAL,          // Traditional username/password authentication
        GOOGLE,         // Google OAuth2 authentication
        MICROSOFT       // Microsoft/Azure AD OAuth2 authentication
    }
    
    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isAdmin() {
        return role == Role.IT_ADMIN || role == Role.SUPER_ADMIN;
    }
    
    public boolean isManager() {
        return role == Role.MANAGER || isAdmin();
    }
}
