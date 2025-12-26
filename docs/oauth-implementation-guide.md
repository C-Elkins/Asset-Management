# OAuth/SSO Implementation Guide

## Current Status

Currently, Krubles uses **username/password authentication with JWT tokens**. OAuth/SSO integrations (Google, Microsoft, Okta, Auth0, etc.) are **planned but not yet implemented**.

## What's Needed for OAuth/SSO

### 1. Backend Dependencies (Spring Boot)

Add to `backend/pom.xml`:

```xml
<!-- OAuth2 Client Support -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>

<!-- OAuth2 Resource Server (for validating OAuth tokens) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>

<!-- SAML Support (for enterprise SSO like Okta, Azure AD) -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-saml2-service-provider</artifactId>
</dependency>
```

### 2. Backend Configuration

Update `application.yml` with OAuth provider details:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
            redirect-uri: "{baseUrl}/login/oauth2/code/google"
          
          microsoft:
            client-id: ${AZURE_CLIENT_ID}
            client-secret: ${AZURE_CLIENT_SECRET}
            scope:
              - openid
              - profile
              - email
            redirect-uri: "{baseUrl}/login/oauth2/code/microsoft"
            authorization-grant-type: authorization_code
          
          okta:
            client-id: ${OKTA_CLIENT_ID}
            client-secret: ${OKTA_CLIENT_SECRET}
            scope:
              - openid
              - profile
              - email
            redirect-uri: "{baseUrl}/login/oauth2/code/okta"
        
        provider:
          microsoft:
            authorization-uri: https://login.microsoftonline.com/common/oauth2/v2.0/authorize
            token-uri: https://login.microsoftonline.com/common/oauth2/v2.0/token
            user-info-uri: https://graph.microsoft.com/oidc/userinfo
            jwk-set-uri: https://login.microsoftonline.com/common/discovery/v2.0/keys
            user-name-attribute: sub
          
          okta:
            authorization-uri: https://${OKTA_DOMAIN}/oauth2/v1/authorize
            token-uri: https://${OKTA_DOMAIN}/oauth2/v1/token
            user-info-uri: https://${OKTA_DOMAIN}/oauth2/v1/userinfo
            jwk-set-uri: https://${OKTA_DOMAIN}/oauth2/v1/keys
```

### 3. Backend Security Configuration

Update `SecurityConfig.java`:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        
        // OAuth2 Login
        .oauth2Login(oauth2 -> oauth2
            .successHandler(new OAuth2SuccessHandler(jwtService, userRepository))
            .failureHandler((request, response, exception) -> {
                response.sendRedirect("/signin?error=oauth_failed");
            })
        )
        
        // OAuth2 Resource Server (validate OAuth tokens)
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
        )
        
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/**", "/health", "/auth/**", "/login/oauth2/**", "/oauth2/**").permitAll()
            .anyRequest().authenticated()
        );

    http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### 4. OAuth Success Handler

Create `OAuth2SuccessHandler.java`:

```java
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                      HttpServletResponse response,
                                      Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        
        // Extract user info from OAuth provider
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String providerId = oauth2User.getAttribute("sub");
        
        // Find or create user in database
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> createUserFromOAuth(email, name, providerId));
        
        // Generate JWT token
        String token = jwtService.generateToken(user.getUsername());
        
        // Redirect to frontend with token
        String redirectUrl = String.format(
            "%s/oauth/callback?token=%s",
            frontendUrl,
            URLEncoder.encode(token, StandardCharsets.UTF_8)
        );
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
    
    private User createUserFromOAuth(String email, String name, String providerId) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(email.split("@")[0]);
        user.setPassword(UUID.randomUUID().toString()); // Random password for OAuth users
        user.setOauthProvider("google"); // or "microsoft", "okta", etc.
        user.setOauthProviderId(providerId);
        return userRepository.save(user);
    }
}
```

### 5. Frontend Changes

Update `Signup.jsx` OAuth buttons:

```jsx
const handleGoogleSignup = () => {
  // Redirect to backend OAuth endpoint
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
};

const handleMicrosoftSignup = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/microsoft';
};

// Update button onClick handlers
<button onClick={handleGoogleSignup} className="...">
  Sign up with Google
</button>

<button onClick={handleMicrosoftSignup} className="...">
  Sign up with Microsoft
</button>
```

Create OAuth callback handler `frontend/src/pages/auth/OAuthCallback.jsx`:

```jsx
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (token) {
      // Store JWT token
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else if (error) {
      navigate('/signin?error=oauth_failed');
    }
  }, [searchParams, navigate]);
  
  return <div>Processing login...</div>;
};
```

### 6. Provider Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
   - `https://yourdomain.com/login/oauth2/code/google`
6. Copy Client ID and Client Secret to environment variables

#### Microsoft Azure AD Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Create new registration
4. Add redirect URI: `http://localhost:8080/login/oauth2/code/microsoft`
5. Create client secret in "Certificates & secrets"
6. Copy Application (client) ID and secret

#### Okta Setup
1. Go to [Okta Developer Console](https://developer.okta.com/)
2. Create new application (Web)
3. Set redirect URI: `http://localhost:8080/login/oauth2/code/okta`
4. Copy Client ID and Client Secret
5. Note your Okta domain (e.g., `dev-123456.okta.com`)

### 7. Database Changes

Add OAuth fields to User entity:

```java
@Entity
@Table(name = "users")
public class User {
    // ... existing fields ...
    
    @Column(name = "oauth_provider")
    private String oauthProvider; // "google", "microsoft", "okta", null
    
    @Column(name = "oauth_provider_id")
    private String oauthProviderId; // Provider's unique user ID
    
    @Column(name = "oauth_access_token")
    private String oauthAccessToken; // Optional: for API calls to provider
    
    @Column(name = "oauth_refresh_token")
    private String oauthRefreshToken; // Optional: for token refresh
}
```

Create migration file `V7__add_oauth_fields.sql`:

```sql
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50),
ADD COLUMN oauth_provider_id VARCHAR(255),
ADD COLUMN oauth_access_token TEXT,
ADD COLUMN oauth_refresh_token TEXT;

CREATE INDEX idx_oauth_provider_id ON users(oauth_provider, oauth_provider_id);
```

## Environment Variables Needed

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft OAuth
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret

# Okta OAuth
OKTA_CLIENT_ID=your_okta_client_id
OKTA_CLIENT_SECRET=your_okta_client_secret
OKTA_DOMAIN=dev-123456.okta.com

# Frontend URL (for OAuth redirect)
FRONTEND_URL=http://localhost:3001
```

## Testing OAuth Locally

1. Set up ngrok for HTTPS callback (OAuth providers require HTTPS):
   ```bash
   ngrok http 8080
   ```

2. Update OAuth provider redirect URIs with ngrok URL

3. Test OAuth flow:
   - Click "Sign up with Google"
   - Complete Google login
   - Verify redirect back to app with JWT token
   - Check user created in database with OAuth fields populated

## Security Considerations

1. **HTTPS Required**: OAuth providers require HTTPS for production
2. **State Parameter**: Spring Security handles CSRF protection via state parameter
3. **Token Storage**: Store OAuth tokens securely (encrypted in database)
4. **Token Refresh**: Implement refresh token flow for long-lived sessions
5. **Scope Limitations**: Only request necessary OAuth scopes
6. **User Linking**: Allow users to link multiple OAuth providers to one account

## Additional Resources

- [Spring Security OAuth2 Docs](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [Google OAuth2 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Okta Developer Docs](https://developer.okta.com/docs/guides/)

## Estimated Implementation Time

- Backend setup: 8-12 hours
- Frontend integration: 4-6 hours
- Testing & debugging: 6-8 hours
- Provider configuration: 2-4 hours
- **Total: ~20-30 hours**

## Priority

Consider implementing in this order:
1. **Google OAuth** (most common, simplest)
2. **Microsoft OAuth** (enterprise users)
3. **Okta** (large enterprises)
4. **Auth0** (if multi-tenant features needed)
