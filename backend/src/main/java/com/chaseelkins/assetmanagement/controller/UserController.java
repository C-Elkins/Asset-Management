package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.UserDTO;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class UserController {
    
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get all users with pagination
     */
    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(Pageable pageable) {
        Page<User> users = userService.getUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Create a new user
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<User> createUser(@Valid @RequestBody UserDTO userDTO) {
        User createdUser = userService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable @Min(1) Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        try {
            User updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete user (soft delete by deactivating)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get user by username
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Activate/Deactivate user
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<User> setUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        try {
            User user = userService.setUserActive(id, active);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get active users only
     */
    @GetMapping("/active")
    public ResponseEntity<Page<User>> getActiveUsers(Pageable pageable) {
        Page<User> users = userService.getActiveUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Search users
     */
    @GetMapping("/search")
    public ResponseEntity<Page<User>> searchUsers(@RequestParam String query, Pageable pageable) {
        Page<User> users = userService.searchUsers(query, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get user statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<UserService.UserStatistics> getUserStatistics() {
        UserService.UserStatistics stats = userService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }
}
