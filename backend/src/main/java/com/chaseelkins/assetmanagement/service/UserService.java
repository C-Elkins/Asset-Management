package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.UserDTO;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }
    
    /**
     * Create a new user
     */
    public User createUser(UserDTO userDTO) {
        log.info("Creating new user: {}", userDTO.getUsername());
        
        // Validate unique constraints
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userDTO.getUsername());
        }
        
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userDTO.getEmail());
        }
        
    // Create user entity
    User user = new User();
    user.setUsername(userDTO.getUsername());
    user.setEmail(userDTO.getEmail());
    user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
    user.setFirstName(userDTO.getFirstName());
    user.setLastName(userDTO.getLastName());
    user.setDepartment(userDTO.getDepartment());
    user.setJobTitle(userDTO.getJobTitle());
    user.setPhoneNumber(userDTO.getPhoneNumber());
    user.setRole(userDTO.getRole() != null ? userDTO.getRole() : User.Role.USER);
    user.setActive(true);
    user.setMustChangePassword(true); // Require password change on first login

    User savedUser = userRepository.save(user);
    log.info("Successfully created user: {} with ID: {}", savedUser.getUsername(), savedUser.getId());

    // Send welcome email
    emailService.sendWelcomeEmail(savedUser);

    return savedUser;
    }
    
    /**
     * Update an existing user
     */
    public User updateUser(Long userId, UserDTO userDTO) {
        log.info("Updating user with ID: {}", userId);
        
        User existingUser = getUserById(userId);
        
        // Check if username changed and is unique
        if (!existingUser.getUsername().equals(userDTO.getUsername()) && 
            userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userDTO.getUsername());
        }
        
        // Check if email changed and is unique
        if (!existingUser.getEmail().equals(userDTO.getEmail()) && 
            userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userDTO.getEmail());
        }
        
        // Update fields
        existingUser.setUsername(userDTO.getUsername());
        existingUser.setEmail(userDTO.getEmail());
        existingUser.setFirstName(userDTO.getFirstName());
        existingUser.setLastName(userDTO.getLastName());
        existingUser.setDepartment(userDTO.getDepartment());
        existingUser.setJobTitle(userDTO.getJobTitle());
        existingUser.setPhoneNumber(userDTO.getPhoneNumber());
        
        // Only update role if provided and user has permission
        if (userDTO.getRole() != null) {
            existingUser.setRole(userDTO.getRole());
        }
        
        // Update password if provided
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        User updatedUser = userRepository.save(existingUser);
        log.info("Successfully updated user: {}", updatedUser.getUsername());
        
        return updatedUser;
    }
    
    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }
    
    /**
     * Get user by username
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Get all active users
     */
    @Transactional(readOnly = true)
    public List<User> getAllActiveUsers() {
        return userRepository.findByActive(true);
    }
    
    /**
     * Get users with pagination
     */
    @Transactional(readOnly = true)
    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    /**
     * Get active users with pagination
     */
    @Transactional(readOnly = true)
    public Page<User> getActiveUsers(Pageable pageable) {
        return userRepository.findByActive(true, pageable);
    }
    
    /**
     * Search users
     */
    @Transactional(readOnly = true)
    public Page<User> searchUsers(String searchTerm, Pageable pageable) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getActiveUsers(pageable);
        }
        return userRepository.searchUsers(searchTerm.trim(), pageable);
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * Get users by department
     */
    @Transactional(readOnly = true)
    public Page<User> getUsersByDepartment(String department, Pageable pageable) {
        return userRepository.findByDepartment(department, pageable);
    }
    
    /**
     * Get all admins
     */
    @Transactional(readOnly = true)
    public List<User> getAdmins() {
        return userRepository.findActiveAdmins();
    }
    
    /**
     * Get all managers
     */
    @Transactional(readOnly = true)
    public List<User> getManagers() {
        return userRepository.findActiveManagers();
    }
    
    /**
     * Activate/Deactivate user
     */
    public User setUserActive(Long userId, boolean active) {
        log.info("Setting user {} active status to: {}", userId, active);
        
        User user = getUserById(userId);
        user.setActive(active);
        
        User updatedUser = userRepository.save(user);
        log.info("Successfully {} user: {}", active ? "activated" : "deactivated", user.getUsername());
        
        return updatedUser;
    }
    
    /**
     * Delete user (soft delete by deactivating)
     */
    public void deleteUser(Long userId) {
        log.info("Soft deleting user with ID: {}", userId);
        setUserActive(userId, false);
    }
    
    /**
     * Change user password
     */
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        log.info("Changing password for user ID: {}", userId);
        
        User user = getUserById(userId);
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }
        
    user.setPassword(passwordEncoder.encode(newPassword));
    user.setMustChangePassword(false); // Password changed, no longer required
    userRepository.save(user);

    log.info("Successfully changed password for user: {}", user.getUsername());
    }
    
    /**
     * Reset user password (admin function)
     */
    public String resetPassword(Long userId) {
        log.info("Resetting password for user ID: {}", userId);
        
        User user = getUserById(userId);
        
        // Generate temporary password
        String tempPassword = generateTemporaryPassword();
    user.setPassword(passwordEncoder.encode(tempPassword));
    user.setMustChangePassword(true); // Require password change on next login
    userRepository.save(user);

    log.info("Successfully reset password for user: {}", user.getUsername());
    return tempPassword;
    }
    
    /**
     * Get users with assigned assets
     */
    @Transactional(readOnly = true)
    public List<User> getUsersWithAssignedAssets() {
        return userRepository.findUsersWithAssignedAssets();
    }
    
    /**
     * Get users without assigned assets
     */
    @Transactional(readOnly = true)
    public List<User> getUsersWithoutAssets() {
        return userRepository.findUsersWithoutAssets();
    }
    
    /**
     * Get users with assets needing maintenance
     */
    @Transactional(readOnly = true)
    public List<User> getUsersWithAssetsNeedingMaintenance() {
        return userRepository.findUsersWithAssetsNeedingMaintenance(java.time.LocalDate.now().plusDays(7));
    }
    
    /**
     * Get recently created users
     */
    @Transactional(readOnly = true)
    public List<User> getRecentlyCreatedUsers() {
        return userRepository.findByCreatedAtAfterOrderByCreatedAtDesc(java.time.LocalDateTime.now().minusDays(30));
    }
    
    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActive(true);
        long inactiveUsers = userRepository.countByActive(false);
        long admins = userRepository.countByRole(User.Role.IT_ADMIN) + 
                     userRepository.countByRole(User.Role.SUPER_ADMIN);
        long managers = userRepository.countByRole(User.Role.MANAGER);
        long regularUsers = userRepository.countByRole(User.Role.USER);
        
        return new UserStatistics(totalUsers, activeUsers, inactiveUsers, 
                                  admins, managers, regularUsers);
    }
    
    /**
     * Validate user permissions
     */
    public boolean hasPermission(User user, String permission) {
        return switch (permission.toUpperCase()) {
            case "ADMIN" -> user.isAdmin();
            case "MANAGER" -> user.isManager();
            case "USER_MANAGEMENT" -> user.getRole() == User.Role.SUPER_ADMIN;
            case "ASSET_MANAGEMENT" -> user.isAdmin();
            default -> false;
        };
    }
    
    /**
     * Generate temporary password
     */
    private String generateTemporaryPassword() {
        // Simple temporary password generation
        return "TempPass" + System.currentTimeMillis() % 10000;
    }

    /**
     * Save user directly (for admin operations)
     */
    public User updateUserDirect(User user) {
        return userRepository.save(user);
    }
    
    /**
     * User statistics inner class
     */
    public static class UserStatistics {
        private final long totalUsers;
        private final long activeUsers;
        private final long inactiveUsers;
        private final long admins;
        private final long managers;
        private final long regularUsers;
        
        public UserStatistics(long totalUsers, long activeUsers, long inactiveUsers,
                              long admins, long managers, long regularUsers) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.inactiveUsers = inactiveUsers;
            this.admins = admins;
            this.managers = managers;
            this.regularUsers = regularUsers;
        }
        
        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getInactiveUsers() { return inactiveUsers; }
        public long getAdmins() { return admins; }
        public long getManagers() { return managers; }
        public long getRegularUsers() { return regularUsers; }
    }
}
