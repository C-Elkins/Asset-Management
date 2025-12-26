package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.UserDTO;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.service.UserService;
import com.chaseelkins.assetmanagement.web.ErrorResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    },
    allowCredentials = "true"
)
public class AdminController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new user (Admin only)
     */
    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO) {
        try {
            User createdUser = userService.createUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromEntity(createdUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to create user"));
        }
    }

    /**
     * Get all users with admin details (Admin only)
     */
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(Pageable pageable) {
        Page<User> users = userService.getUsers(pageable);
        Page<UserDTO> userDTOs = users.map(UserDTO::fromEntity);
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get user by ID (Admin only)
     */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(UserDTO.fromEntity(user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update user (Admin only)
     */
    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        try {
            User updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete/Deactivate user (Admin only)
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Reset user password and force change on next login (Admin only)
     */
    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id) {
        try {
            String tempPassword = userService.resetPassword(id);
            return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully",
                "temporaryPassword", tempPassword,
                "note", "User must change password on next login"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to reset password"));
        }
    }

    /**
     * Force password change requirement (Admin only)
     */
    @PostMapping("/users/{id}/require-password-change")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> requirePasswordChange(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            user.setMustChangePassword(true);
            userService.updateUserDirect(user);
            return ResponseEntity.ok(Map.of("message", "Password change now required for user"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Change user password (Admin can set any password without old password)
     */
    @PostMapping("/users/{id}/change-password")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> changeUserPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Password must be at least 6 characters"));
        }
        
        try {
            User user = userService.getUserById(id);
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setMustChangePassword(false); // Admin set it, so no need to force change
            userService.updateUserDirect(user);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Toggle user active status (Admin only)
     */
    @PatchMapping("/users/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            user.setActive(!user.getActive());
            User updatedUser = userService.updateUserDirect(user);
            return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get system statistics (Admin only)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<UserService.UserStatistics> getSystemStatistics() {
        UserService.UserStatistics stats = userService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Search users with admin details (Admin only)
     */
    @GetMapping("/users/search")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<UserDTO>> searchUsers(@RequestParam String query, Pageable pageable) {
        Page<User> users = userService.searchUsers(query, pageable);
        Page<UserDTO> userDTOs = users.map(UserDTO::fromEntity);
        return ResponseEntity.ok(userDTOs);
    }
}
