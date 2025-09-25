package com.chaseelkins.assetmanagement.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.chaseelkins.assetmanagement.dto.UserDTO;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    // Backward compatibility: legacy field 'token' mirrors accessToken
    @JsonProperty("token")
    private String token;

    private String accessToken;
    private String refreshToken; // until moved to HttpOnly cookie
    private Long expiresIn; // seconds
    private String tokenType = "Bearer";
    private UserDTO user;

    public AuthResponse() {}

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
        this.token = accessToken;
    }

    public AuthResponse(String accessToken, String refreshToken, long expiresIn, UserDTO user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
        this.token = accessToken;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; this.token = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }
}
