package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.security.JwtTokenProvider;
import com.chaseelkins.assetmanagement.web.AuthRequest;
import com.chaseelkins.assetmanagement.web.AuthResponse;
import com.chaseelkins.assetmanagement.web.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            UserDetails principal = (UserDetails) auth.getPrincipal();
            String token = jwtTokenProvider.generateToken(principal);
            return ResponseEntity.ok(new AuthResponse(token));
    } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("Invalid username or password. Please check your credentials and try again."));
    } catch (AuthenticationException ex) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Authentication failed. Please verify your account status and try again."));
    } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Login failed. Please try again."));
        }
    }
}
