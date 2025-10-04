package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.config.StripeConfig;
import com.chaseelkins.assetmanagement.service.StripeService;
import com.chaseelkins.assetmanagement.tenant.TenantContext;
import com.stripe.exception.StripeException;
import com.stripe.model.SetupIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeController {

    private final StripeConfig stripeConfig;
    private final StripeService stripeService;

    /**
     * Public endpoint for frontend to obtain publishable key
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of("publishableKey", stripeConfig.getPublishableKey()));
    }

    /**
     * Admin endpoint to create a SetupIntent for collecting a payment method
     */
    @PostMapping("/setup-intent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSetupIntent() {
        try {
            Long tenantId = TenantContext.getTenantId();
            SetupIntent setupIntent = stripeService.createSetupIntentForTenant(tenantId);
            return ResponseEntity.ok(Map.of(
                    "clientSecret", setupIntent.getClientSecret()
            ));
        } catch (StripeException e) {
            log.error("Error creating setup intent", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Optional helper to expose configured price IDs in non-prod for wiring UI quickly
     */
    @GetMapping("/price-ids")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getPriceIds() {
        return ResponseEntity.ok(stripeConfig.getPriceIds());
    }
}
