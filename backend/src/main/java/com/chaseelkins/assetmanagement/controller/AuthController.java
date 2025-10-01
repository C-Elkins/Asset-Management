package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.security.JwtTokenProvider;
import com.chaseelkins.assetmanagement.service.RefreshTokenService;
import com.chaseelkins.assetmanagement.service.RefreshTokenService.GeneratedToken;
import com.chaseelkins.assetmanagement.service.UserService;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import com.chaseelkins.assetmanagement.dto.UserDTO;
import com.chaseelkins.assetmanagement.web.AuthRequest;
import com.chaseelkins.assetmanagement.web.AuthResponse;
import com.chaseelkins.assetmanagement.web.ErrorResponse;
import com.chaseelkins.assetmanagement.web.PasswordChangeRequest;
import org.springframework.http.ResponseEntity;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
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
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final UserService userService;

    private final Counter loginSuccess;
    private final Counter loginFailure;
    private final Counter refreshSuccess;
    private final Counter refreshFailure;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider,
                          RefreshTokenService refreshTokenService,
                          UserRepository userRepository,
                          UserService userService,
                          MeterRegistry registry) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.loginSuccess = Counter.builder("auth_login_success_total").description("Successful logins").register(registry);
        this.loginFailure = Counter.builder("auth_login_failure_total").description("Failed logins").register(registry);
        this.refreshSuccess = Counter.builder("auth_refresh_success_total").description("Successful refreshes").register(registry);
        this.refreshFailure = Counter.builder("auth_refresh_failure_total").description("Failed refresh attempts").register(registry);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            UserDetails principal = (UserDetails) auth.getPrincipal();
            String accessToken = jwtTokenProvider.generateToken(principal);
            String userAgent = httpRequest.getHeader("User-Agent");
            String ip = httpRequest.getRemoteAddr();
            User user = userRepository.findByUsername(principal.getUsername()).orElseThrow();
            if (Boolean.TRUE.equals(user.getMustChangePassword())) {
                // Do not issue tokens, require password change
                loginFailure.increment();
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("Password change required. Please change your password before logging in."));
            }
            GeneratedToken refresh = refreshTokenService.generate(user, userAgent, ip);
            long expiresInSeconds = jwtTokenProvider.getAccessExpirationMillis() / 1000;
            AuthResponse payload = new AuthResponse(accessToken, refresh.raw(), expiresInSeconds, UserDTO.fromEntity(user));
            ResponseEntity.BodyBuilder builder = ResponseEntity.ok();
            builder.header("X-Access-Token-Expires-In", String.valueOf(expiresInSeconds));
            loginSuccess.increment();
            return builder.body(payload);
        } catch (BadCredentialsException ex) {
            loginFailure.increment();
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("Invalid username or password. Please check your credentials and try again."));
        } catch (AuthenticationException ex) {
            loginFailure.increment();
            return ResponseEntity.status(401)
                .body(new ErrorResponse("Authentication failed. Please verify your account status and try again."));
        } catch (Exception ex) {
            loginFailure.increment();
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Login failed. Please try again."));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader(value = "X-Refresh-Token", required = false) String refreshToken,
                                     HttpServletRequest httpRequest) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Missing refresh token"));
        }
        try {
            String userAgent = httpRequest.getHeader("User-Agent");
            String ip = httpRequest.getRemoteAddr();
            GeneratedToken rotated = refreshTokenService.rotate(refreshToken, userAgent, ip);
            User user = rotated.entity().getUser();
            UserDetails principal = new org.springframework.security.core.userdetails.User(
                    user.getUsername(), user.getPassword(), java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            );
            String accessToken = jwtTokenProvider.generateToken(principal);
            long expiresInSeconds = jwtTokenProvider.getAccessExpirationMillis() / 1000;
            AuthResponse payload = new AuthResponse(accessToken, rotated.raw(), expiresInSeconds, UserDTO.fromEntity(user));
            ResponseEntity.BodyBuilder builder = ResponseEntity.ok();
            builder.header("X-Access-Token-Expires-In", String.valueOf(expiresInSeconds));
            refreshSuccess.increment();
            return builder.body(payload);
        } catch (IllegalArgumentException ex) {
            refreshFailure.increment();
            return ResponseEntity.status(401).body(new ErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            refreshFailure.increment();
            return ResponseEntity.status(500).body(new ErrorResponse("Could not refresh token"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(new ErrorResponse("Unauthorized"));
        }
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "X-Refresh-Token", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Missing refresh token"));
        }
        refreshTokenService.revoke(refreshToken);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(new ErrorResponse("Unauthorized"));
        }
        
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        
        try {
            userService.changePassword(user.getId(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to change password"));
        }
    }
}
 
