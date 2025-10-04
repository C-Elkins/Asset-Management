package com.chaseelkins.assetmanagement.tenant;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Servlet filter that extracts tenant information from subdomain and sets it in TenantContext.
 * This ensures every request is associated with the correct tenant.
 * 
 * Supports formats:
 * - subdomain.yourdomain.com
 * - subdomain.localhost:8080
 * - localhost:8080 (defaults to "default" tenant)
 */
@Component
public class TenantFilter implements Filter {
    
    private static final Logger log = LoggerFactory.getLogger(TenantFilter.class);
    private static final Pattern SUBDOMAIN_PATTERN = Pattern.compile("^([a-z0-9][a-z0-9-]*)\\.(.+)$");
    
    @Autowired
    private TenantResolver tenantResolver;
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        try {
            String subdomain = extractSubdomain(httpRequest);
            log.debug("Extracted subdomain: {}", subdomain);
            
            if (subdomain != null && !subdomain.isEmpty()) {
                TenantContext.setSubdomain(subdomain);
                
                // Resolve tenant ID from subdomain
                Long tenantId = tenantResolver.resolveTenantId(subdomain);
                
                if (tenantId != null) {
                    TenantContext.setTenantId(tenantId);
                    log.debug("Resolved tenant ID: {} for subdomain: {}", tenantId, subdomain);
                } else {
                    log.warn("No tenant found for subdomain: {}", subdomain);
                }
            } else {
                log.debug("No subdomain found, using default tenant");
            }
            
            chain.doFilter(request, response);
            
        } finally {
            // Always clear tenant context after request to prevent memory leaks
            TenantContext.clear();
        }
    }
    
    /**
     * Extract subdomain from HTTP request
     */
    private String extractSubdomain(HttpServletRequest request) {
        String host = request.getHeader("Host");
        
        if (host == null || host.isEmpty()) {
            host = request.getServerName();
        }
        
        // Remove port if present
        if (host.contains(":")) {
            host = host.substring(0, host.indexOf(":"));
        }
        
        log.debug("Processing host: {}", host);
        
        // Check for X-Tenant-ID header (useful for API clients)
        String tenantHeader = request.getHeader("X-Tenant-Subdomain");
        if (tenantHeader != null && !tenantHeader.isEmpty()) {
            log.debug("Using X-Tenant-Subdomain header: {}", tenantHeader);
            return tenantHeader.toLowerCase();
        }
        
        // Handle localhost (development)
        if (host.equals("localhost") || host.equals("127.0.0.1")) {
            return "default";
        }
        
        // Extract subdomain from host
        Matcher matcher = SUBDOMAIN_PATTERN.matcher(host);
        if (matcher.matches()) {
            String subdomain = matcher.group(1);
            log.debug("Extracted subdomain from host: {}", subdomain);
            return subdomain.toLowerCase();
        }
        
        // No subdomain found, use default
        return "default";
    }
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("TenantFilter initialized");
    }
    
    @Override
    public void destroy() {
        log.info("TenantFilter destroyed");
    }
}
