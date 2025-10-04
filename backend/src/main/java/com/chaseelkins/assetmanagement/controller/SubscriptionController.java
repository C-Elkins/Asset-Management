package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.model.*;
import com.chaseelkins.assetmanagement.repository.TenantRepository;
import com.chaseelkins.assetmanagement.service.StripeService;
import com.chaseelkins.assetmanagement.tenant.TenantContext;
import com.stripe.exception.StripeException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final StripeService stripeService;
    private final TenantRepository tenantRepository;

    /**
     * Get current subscription for tenant
     */
    @GetMapping("/current")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Subscription> getCurrentSubscription() {
        Long tenantId = TenantContext.getTenantId();
        return stripeService.getSubscription(tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new subscription
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSubscription(@RequestBody CreateSubscriptionRequest request) {
        try {
            Long tenantId = TenantContext.getTenantId();
            Subscription subscription = stripeService.createSubscription(
                    tenantId,
                    request.getPriceId(),
                    request.getPaymentMethodId()
            );
            return ResponseEntity.ok(subscription);
        } catch (StripeException e) {
            log.error("Error creating subscription", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update subscription (change plan)
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSubscription(@RequestBody UpdateSubscriptionRequest request) {
        try {
            Long tenantId = TenantContext.getTenantId();
            Subscription subscription = stripeService.updateSubscription(tenantId, request.getNewPriceId());
            return ResponseEntity.ok(subscription);
        } catch (StripeException e) {
            log.error("Error updating subscription", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel subscription
     */
    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelSubscription(@RequestParam(defaultValue = "false") boolean immediately) {
        try {
            Long tenantId = TenantContext.getTenantId();
            Subscription subscription = stripeService.cancelSubscription(tenantId, immediately);
            return ResponseEntity.ok(subscription);
        } catch (StripeException e) {
            log.error("Error canceling subscription", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Resume canceled subscription
     */
    @PostMapping("/resume")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resumeSubscription() {
        try {
            Long tenantId = TenantContext.getTenantId();
            Subscription subscription = stripeService.resumeSubscription(tenantId);
            return ResponseEntity.ok(subscription);
        } catch (StripeException e) {
            log.error("Error resuming subscription", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get billing portal URL
     */
    @GetMapping("/billing-portal")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBillingPortal(@RequestParam String returnUrl) {
        try {
            Long tenantId = TenantContext.getTenantId();
            String portalUrl = stripeService.createBillingPortalSession(tenantId, returnUrl);
            return ResponseEntity.ok(Map.of("url", portalUrl));
        } catch (StripeException e) {
            log.error("Error creating billing portal session", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get invoices
     */
    @GetMapping("/invoices")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Invoice>> getInvoices(Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        List<Invoice> invoices = stripeService.getInvoices(tenantId, pageable);
        return ResponseEntity.ok(invoices);
    }

    /**
     * Get payment methods
     */
    @GetMapping("/payment-methods")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentMethod>> getPaymentMethods() {
        Long tenantId = TenantContext.getTenantId();
        List<PaymentMethod> paymentMethods = stripeService.getPaymentMethods(tenantId);
        return ResponseEntity.ok(paymentMethods);
    }

    /**
     * Add payment method
     */
    @PostMapping("/payment-methods")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addPaymentMethod(@RequestBody AddPaymentMethodRequest request) {
        try {
            Long tenantId = TenantContext.getTenantId();
            
            Tenant tenant = tenantRepository.findById(tenantId)
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            
            if (tenant.getStripeCustomerId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No Stripe customer found"));
            }
            
            // Attach payment method (this also saves to database)
            PaymentMethod paymentMethod = stripeService.attachPaymentMethod(
                    tenant.getStripeCustomerId(), request.getPaymentMethodId());
            
            return ResponseEntity.ok(paymentMethod);
        } catch (StripeException e) {
            log.error("Error adding payment method", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get usage records
     */
    @GetMapping("/usage")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UsageRecord>> getUsageRecords(Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        List<UsageRecord> usageRecords = stripeService.getUsageRecords(tenantId, pageable);
        return ResponseEntity.ok(usageRecords);
    }

    // Request DTOs
    
    @Data
    public static class CreateSubscriptionRequest {
        private String priceId;
        private String paymentMethodId;
    }

    @Data
    public static class UpdateSubscriptionRequest {
        private String newPriceId;
    }

    @Data
    public static class AddPaymentMethodRequest {
        private String paymentMethodId;
    }
}
