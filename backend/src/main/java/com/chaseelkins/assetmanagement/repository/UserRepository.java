package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic finder methods
    Optional<User> findByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);
    
    // OAuth2 finder methods
    Optional<User> findByGoogleId(String googleId);
    
    Optional<User> findByMicrosoftId(String microsoftId);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    // Find users by role
    List<User> findByRole(User.Role role);
    
    // Find active/inactive users
    List<User> findByActive(Boolean active);
    
    Page<User> findByActive(Boolean active, Pageable pageable);
    
    // Find users by department
    List<User> findByDepartment(String department);
    
    Page<User> findByDepartment(String department, Pageable pageable);
    
    // Search users by name or email
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find users with assigned assets
    @Query("SELECT DISTINCT u FROM User u JOIN u.assignedAssets a WHERE a.status = 'ASSIGNED'")
    List<User> findUsersWithAssignedAssets();
    
    // Find users by role and department
    List<User> findByRoleAndDepartment(User.Role role, String department);
    
    // Find admins
    @Query("SELECT u FROM User u WHERE u.role IN ('IT_ADMIN', 'SUPER_ADMIN') AND u.active = true")
    List<User> findActiveAdmins();
    
    // Find managers
    @Query("SELECT u FROM User u WHERE u.role IN ('MANAGER', 'IT_ADMIN', 'SUPER_ADMIN') AND u.active = true")
    List<User> findActiveManagers();
    
    // Count users by role
    long countByRole(User.Role role);
    
    // Count active users
    long countByActive(Boolean active);
    
    // Find users who haven't been assigned any assets
    @Query("SELECT u FROM User u WHERE u.assignedAssets IS EMPTY AND u.active = true")
    List<User> findUsersWithoutAssets();
    
    // Find users with assets needing maintenance (parameterized to avoid HQL date arithmetic)
    @Query("SELECT DISTINCT u FROM User u JOIN u.assignedAssets a " +
           "WHERE a.nextMaintenance <= :endDate AND a.status = 'ASSIGNED'")
    List<User> findUsersWithAssetsNeedingMaintenance(@Param("endDate") java.time.LocalDate endDate);
    
       // Find recently created users (last N days) using method naming
       List<User> findByCreatedAtAfterOrderByCreatedAtDesc(java.time.LocalDateTime cutoffDate);
}
