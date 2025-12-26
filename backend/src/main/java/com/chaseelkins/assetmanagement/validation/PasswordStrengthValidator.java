package com.chaseelkins.assetmanagement.validation;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validates password strength according to security best practices.
 * 
 * Password Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * - Not in common passwords list
 * - No sequential characters (e.g., "abc", "123")
 * 
 * Based on NIST SP 800-63B guidelines.
 */
@Component
public class PasswordStrengthValidator {
    
    private static final int MINIMUM_LENGTH = 12;
    private static final int MAXIMUM_LENGTH = 128;
    
    // Common weak passwords (in production, use a comprehensive list)
    private static final Set<String> COMMON_PASSWORDS = Set.of(
        "password123", "password1234", "123456789012", "qwerty123456",
        "welcome123456", "admin123456", "letmein12345", "password12345",
        "passw0rd1234", "p@ssw0rd1234", "Password1234", "P@ssw0rd1234"
    );
    
    // Regex patterns
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("\\d");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]");
    private static final Pattern SEQUENTIAL_PATTERN = Pattern.compile("(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)");
    
    /**
     * Validates password strength and returns a list of validation errors.
     * 
     * @param password The password to validate
     * @return List of validation error messages (empty if valid)
     */
    public List<String> validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        
        if (password == null || password.isEmpty()) {
            errors.add("Password is required");
            return errors;
        }
        
        // Length check
        if (password.length() < MINIMUM_LENGTH) {
            errors.add(String.format("Password must be at least %d characters long", MINIMUM_LENGTH));
        }
        
        if (password.length() > MAXIMUM_LENGTH) {
            errors.add(String.format("Password must not exceed %d characters", MAXIMUM_LENGTH));
        }
        
        // Complexity checks
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one uppercase letter (A-Z)");
        }
        
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one lowercase letter (a-z)");
        }
        
        if (!DIGIT_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one digit (0-9)");
        }
        
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)");
        }
        
        // Check for common passwords
        if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
            errors.add("This password is too common. Please choose a more unique password");
        }
        
        // Check for sequential characters
        if (SEQUENTIAL_PATTERN.matcher(password.toLowerCase()).find()) {
            errors.add("Password must not contain sequential characters (e.g., 'abc', '123')");
        }
        
        // Check for repeated characters (e.g., "aaa", "111")
        if (hasRepeatedCharacters(password, 3)) {
            errors.add("Password must not contain 3 or more repeated characters");
        }
        
        return errors;
    }
    
    /**
     * Validates password and throws exception if invalid.
     * 
     * @param password The password to validate
     * @throws IllegalArgumentException if password is invalid
     */
    public void validatePasswordOrThrow(String password) {
        List<String> errors = validatePassword(password);
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("Password validation failed: " + String.join("; ", errors));
        }
    }
    
    /**
     * Calculate password strength score (0-5).
     * 
     * @param password The password to evaluate
     * @return Strength score: 0=Very Weak, 1=Weak, 2=Fair, 3=Good, 4=Strong, 5=Very Strong
     */
    public int calculateStrengthScore(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }
        
        int score = 0;
        
        // Base score for length
        if (password.length() >= MINIMUM_LENGTH) score++;
        if (password.length() >= 16) score++;
        if (password.length() >= 20) score++;
        
        // Complexity bonus
        if (UPPERCASE_PATTERN.matcher(password).find()) score++;
        if (LOWERCASE_PATTERN.matcher(password).find()) score++;
        if (DIGIT_PATTERN.matcher(password).find()) score++;
        if (SPECIAL_CHAR_PATTERN.matcher(password).find()) score++;
        
        // Penalties
        if (COMMON_PASSWORDS.contains(password.toLowerCase())) score -= 3;
        if (SEQUENTIAL_PATTERN.matcher(password.toLowerCase()).find()) score -= 2;
        if (hasRepeatedCharacters(password, 3)) score -= 1;
        
        // Normalize to 0-5 range
        return Math.max(0, Math.min(5, score));
    }
    
    /**
     * Get strength label for display.
     * 
     * @param password The password to evaluate
     * @return Human-readable strength label
     */
    public String getStrengthLabel(String password) {
        int score = calculateStrengthScore(password);
        return switch (score) {
            case 0, 1 -> "Very Weak";
            case 2 -> "Weak";
            case 3 -> "Fair";
            case 4 -> "Strong";
            case 5 -> "Very Strong";
            default -> "Unknown";
        };
    }
    
    private boolean hasRepeatedCharacters(String password, int threshold) {
        if (password.length() < threshold) {
            return false;
        }
        
        for (int i = 0; i <= password.length() - threshold; i++) {
            char c = password.charAt(i);
            boolean repeated = true;
            
            for (int j = 1; j < threshold; j++) {
                if (password.charAt(i + j) != c) {
                    repeated = false;
                    break;
                }
            }
            
            if (repeated) {
                return true;
            }
        }
        
        return false;
    }
}
