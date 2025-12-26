package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.config.StripeConfig;
import com.chaseelkins.assetmanagement.model.Tenant;
import com.chaseelkins.assetmanagement.repository.*;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.SetupIntent;
import com.stripe.param.SetupIntentCreateParams;
import com.stripe.param.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

/**
 * Service for handling Stripe payment operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final StripeConfig stripeConfig;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final UsageRecordRepository usageRecordRepository;
    private final TenantRepository tenantRepository;

    /**
     * Create a Stripe customer for a tenant
     */
    public Customer createCustomer(Tenant tenant) throws StripeException {
        log.info("Creating Stripe customer for tenant: {}", tenant.getId());

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(tenant.getContactEmail())
                .setName(tenant.getName())
                .putMetadata("tenant_id", tenant.getId().toString())
                .putMetadata("subdomain", tenant.getSubdomain())
                .build();

        Customer customer = Customer.create(params);

        // Save customer ID to tenant
        tenant.setStripeCustomerId(customer.getId());
        tenantRepository.save(tenant);

        log.info("Created Stripe customer: {} for tenant: {}", customer.getId(), tenant.getId());
        return customer;
    }

    /**
     * Create a subscription for a tenant
     */
    @Transactional
    public com.chaseelkins.assetmanagement.model.Subscription createSubscription(
            Long tenantId, String priceId, String paymentMethodId) throws StripeException {
        log.info("Creating subscription for tenant: {} with price: {}", tenantId, priceId);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // Create customer if doesn't exist
        String customerId = tenant.getStripeCustomerId();
        if (customerId == null) {
            Customer customer = createCustomer(tenant);
            customerId = customer.getId();
        }

        // Attach payment method to customer
        if (paymentMethodId != null) {
            attachPaymentMethod(customerId, paymentMethodId);
        }

        // Create subscription with trial
        SubscriptionCreateParams.Builder subscriptionBuilder =
                SubscriptionCreateParams.builder()
                        .setCustomer(customerId)
                        .addItem(SubscriptionCreateParams.Item.builder()
                                .setPrice(priceId)
                                .build())
                        .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
                        .putMetadata("tenant_id", tenantId.toString())
                        .setTrialPeriodDays(14L); // 14-day trial

        if (paymentMethodId != null) {
            subscriptionBuilder.setDefaultPaymentMethod(paymentMethodId);
        }

        com.stripe.model.Subscription stripeSubscription =
                com.stripe.model.Subscription.create(subscriptionBuilder.build());

        // Save subscription to database
        com.chaseelkins.assetmanagement.model.Subscription subscription = 
                mapStripeSubscriptionToEntity(stripeSubscription, tenantId);
        return subscriptionRepository.save(subscription);
    }

    /**
     * Update subscription (change plan)
     */
    @Transactional
    public com.chaseelkins.assetmanagement.model.Subscription updateSubscription(
            Long tenantId, String newPriceId) throws StripeException {
        log.info("Updating subscription for tenant: {} to price: {}", tenantId, newPriceId);

        com.chaseelkins.assetmanagement.model.Subscription subscription = 
                subscriptionRepository.findByTenantId(tenantId)
                        .orElseThrow(() -> new RuntimeException("Subscription not found"));

        // Get Stripe subscription
        com.stripe.model.Subscription stripeSubscription = 
                com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        // Update subscription items
        SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
                .addItem(SubscriptionUpdateParams.Item.builder()
                        .setId(stripeSubscription.getItems().getData().get(0).getId())
                        .setPrice(newPriceId)
                        .build())
                .setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.ALWAYS_INVOICE)
                .build();

        stripeSubscription = stripeSubscription.update(params);

        // Update local subscription
        com.chaseelkins.assetmanagement.model.Subscription updatedSubscription = 
                mapStripeSubscriptionToEntity(stripeSubscription, tenantId);
        return subscriptionRepository.save(updatedSubscription);
    }

    /**
     * Cancel subscription
     */
    @Transactional
    public com.chaseelkins.assetmanagement.model.Subscription cancelSubscription(
            Long tenantId, boolean immediately) throws StripeException {
        log.info("Canceling subscription for tenant: {} (immediately: {})", tenantId, immediately);

        com.chaseelkins.assetmanagement.model.Subscription subscription = 
                subscriptionRepository.findByTenantId(tenantId)
                        .orElseThrow(() -> new RuntimeException("Subscription not found"));

        com.stripe.model.Subscription stripeSubscription = 
                com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        if (immediately) {
            stripeSubscription.cancel();
            subscription.setStatus(com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.CANCELED);
        } else {
            SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
                    .setCancelAtPeriodEnd(true)
                    .build();
            stripeSubscription.update(params);
            subscription.setCancelAtPeriodEnd(true);
        }

        subscription.setUpdatedAt(LocalDateTime.now());
        return subscriptionRepository.save(subscription);
    }

    /**
     * Resume a canceled subscription
     */
    @Transactional
    public com.chaseelkins.assetmanagement.model.Subscription resumeSubscription(
            Long tenantId) throws StripeException {
        log.info("Resuming subscription for tenant: {}", tenantId);

        com.chaseelkins.assetmanagement.model.Subscription subscription = 
                subscriptionRepository.findByTenantId(tenantId)
                        .orElseThrow(() -> new RuntimeException("Subscription not found"));

        com.stripe.model.Subscription stripeSubscription = 
                com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
                .setCancelAtPeriodEnd(false)
                .build();

        stripeSubscription.update(params);

        subscription.setCancelAtPeriodEnd(false);
        subscription.setStatus(com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.ACTIVE);
        subscription.setUpdatedAt(LocalDateTime.now());
        return subscriptionRepository.save(subscription);
    }

    /**
     * Attach payment method to customer
     */
    public com.chaseelkins.assetmanagement.model.PaymentMethod attachPaymentMethod(
            String customerId, String paymentMethodId) throws StripeException {
        log.info("Attaching payment method: {} to customer: {}", paymentMethodId, customerId);

        com.stripe.model.PaymentMethod stripePaymentMethod = 
                com.stripe.model.PaymentMethod.retrieve(paymentMethodId);

        PaymentMethodAttachParams params = PaymentMethodAttachParams.builder()
                .setCustomer(customerId)
                .build();

        stripePaymentMethod.attach(params);

        // Set as default payment method
        CustomerUpdateParams customerParams = CustomerUpdateParams.builder()
                .setInvoiceSettings(CustomerUpdateParams.InvoiceSettings.builder()
                        .setDefaultPaymentMethod(paymentMethodId)
                        .build())
                .build();

        Customer.retrieve(customerId).update(customerParams);

        // Save payment method to database
        Tenant tenant = tenantRepository.findByStripeCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        com.chaseelkins.assetmanagement.model.PaymentMethod paymentMethod = 
                new com.chaseelkins.assetmanagement.model.PaymentMethod();
        paymentMethod.setTenantId(tenant.getId());
        paymentMethod.setStripePaymentMethodId(paymentMethodId);
        paymentMethod.setType(stripePaymentMethod.getType());
        paymentMethod.setIsDefault(true);

        if (stripePaymentMethod.getCard() != null) {
            paymentMethod.setCardBrand(stripePaymentMethod.getCard().getBrand());
            paymentMethod.setCardLast4(stripePaymentMethod.getCard().getLast4());
            paymentMethod.setCardExpMonth(stripePaymentMethod.getCard().getExpMonth().intValue());
            paymentMethod.setCardExpYear(stripePaymentMethod.getCard().getExpYear().intValue());
        }

        return paymentMethodRepository.save(paymentMethod);
    }

    /**
     * Create a billing portal session
     */
    public String createBillingPortalSession(Long tenantId, String returnUrl) throws StripeException {
        log.info("Creating billing portal session for tenant: {}", tenantId);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (tenant.getStripeCustomerId() == null) {
            throw new RuntimeException("Tenant has no Stripe customer");
        }

        com.stripe.param.billingportal.SessionCreateParams params =
                com.stripe.param.billingportal.SessionCreateParams.builder()
                        .setCustomer(tenant.getStripeCustomerId())
                        .setReturnUrl(returnUrl)
                        .build();

        com.stripe.model.billingportal.Session session = 
                com.stripe.model.billingportal.Session.create(params);

        return session.getUrl();
    }

        /**
         * Create a SetupIntent for the tenant's Stripe customer to collect a payment method
         */
        public SetupIntent createSetupIntentForTenant(Long tenantId) throws StripeException {
                log.info("Creating setup intent for tenant: {}", tenantId);

                Tenant tenant = tenantRepository.findById(tenantId)
                                .orElseThrow(() -> new RuntimeException("Tenant not found"));

                String customerId = tenant.getStripeCustomerId();
                if (customerId == null) {
                        // Ensure the tenant has a customer in Stripe
                        Customer customer = createCustomer(tenant);
                        customerId = customer.getId();
                }

                SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                                .setCustomer(customerId)
                                .addPaymentMethodType("card")
                                .putMetadata("tenant_id", String.valueOf(tenantId))
                                .build();

                return SetupIntent.create(params);
        }

    /**
     * Report usage to Stripe for metered billing
     */
    public void reportUsage(Long tenantId, int assetCount, int overageCount) throws StripeException {
        log.info("Reporting usage for tenant: {} - assets: {}, overage: {}", 
                tenantId, assetCount, overageCount);

        if (overageCount <= 0) {
            log.debug("No overage to report for tenant: {}", tenantId);
            return;
        }

        com.chaseelkins.assetmanagement.model.Subscription subscription = 
                subscriptionRepository.findByTenantId(tenantId)
                        .orElseThrow(() -> new RuntimeException("Subscription not found"));

        // Find the metered subscription item
        com.stripe.model.Subscription stripeSubscription = 
                com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        String meteredItemId = null;
        for (com.stripe.model.SubscriptionItem item : stripeSubscription.getItems().getData()) {
            // Check if this is a metered price
            if (item.getPrice().getBillingScheme() != null && 
                item.getPrice().getBillingScheme().equals("tiered")) {
                meteredItemId = item.getId();
                break;
            }
        }

        if (meteredItemId == null) {
            log.warn("No metered item found for subscription: {}", subscription.getStripeSubscriptionId());
            return;
        }

        // Report usage
        com.stripe.param.UsageRecordCreateOnSubscriptionItemParams params = 
                com.stripe.param.UsageRecordCreateOnSubscriptionItemParams.builder()
                        .setQuantity((long) overageCount)
                        .setTimestamp(System.currentTimeMillis() / 1000)
                        .build();

        com.stripe.model.UsageRecord.createOnSubscriptionItem(meteredItemId, params, null);

        // Save usage record
        com.chaseelkins.assetmanagement.model.UsageRecord usageRecord = 
                new com.chaseelkins.assetmanagement.model.UsageRecord();
        usageRecord.setTenantId(tenantId);
        usageRecord.setAssetCount(assetCount);
        usageRecord.setOverageCount(overageCount);
        usageRecord.setRecordedAt(LocalDateTime.now());
        usageRecord.setReportedToStripe(true);
        usageRecord.setReportTimestamp(LocalDateTime.now());
        usageRecordRepository.save(usageRecord);
    }

    /**
     * Get subscription for tenant
     */
    public Optional<com.chaseelkins.assetmanagement.model.Subscription> getSubscription(Long tenantId) {
        return subscriptionRepository.findByTenantId(tenantId);
    }

    /**
     * Get invoices for tenant
     */
    public List<com.chaseelkins.assetmanagement.model.Invoice> getInvoices(Long tenantId, Pageable pageable) {
        Page<com.chaseelkins.assetmanagement.model.Invoice> invoicePage = 
                invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        return invoicePage.getContent();
    }

    /**
     * Get payment methods for tenant
     */
    public List<com.chaseelkins.assetmanagement.model.PaymentMethod> getPaymentMethods(Long tenantId) {
        return paymentMethodRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    /**
     * Get usage records for tenant
     */
    public List<com.chaseelkins.assetmanagement.model.UsageRecord> getUsageRecords(Long tenantId, Pageable pageable) {
        Page<com.chaseelkins.assetmanagement.model.UsageRecord> page = 
                usageRecordRepository.findByTenantIdOrderByRecordedAtDesc(tenantId, pageable);
        return page.getContent();
    }

    /**
     * Map Stripe subscription to local entity
     */
    private com.chaseelkins.assetmanagement.model.Subscription mapStripeSubscriptionToEntity(
            com.stripe.model.Subscription stripeSubscription, Long tenantId) {
        
        com.chaseelkins.assetmanagement.model.Subscription subscription = 
                subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId())
                        .orElse(new com.chaseelkins.assetmanagement.model.Subscription());

        subscription.setTenantId(tenantId);
        subscription.setStripeSubscriptionId(stripeSubscription.getId());
        subscription.setStripeCustomerId(stripeSubscription.getCustomer());
        subscription.setStripePriceId(stripeSubscription.getItems().getData().get(0).getPrice().getId());
        subscription.setStatus(mapStripeStatus(stripeSubscription.getStatus()));
        
        // Map plan name from price ID
        String priceId = subscription.getStripePriceId();
        if (priceId.contains("professional")) {
            subscription.setPlanName(com.chaseelkins.assetmanagement.model.Subscription.PlanName.PROFESSIONAL);
        } else if (priceId.contains("enterprise")) {
            subscription.setPlanName(com.chaseelkins.assetmanagement.model.Subscription.PlanName.ENTERPRISE);
        } else {
            subscription.setPlanName(com.chaseelkins.assetmanagement.model.Subscription.PlanName.FREE);
        }

        // Map billing cycle
        if (stripeSubscription.getItems().getData().get(0).getPrice().getRecurring() != null) {
            String interval = stripeSubscription.getItems().getData().get(0).getPrice().getRecurring().getInterval();
            subscription.setBillingCycle(interval.equals("year") ? 
                    com.chaseelkins.assetmanagement.model.Subscription.BillingCycle.ANNUAL : 
                    com.chaseelkins.assetmanagement.model.Subscription.BillingCycle.MONTHLY);
        }

        // Set periods
        subscription.setCurrentPeriodStart(LocalDateTime.ofInstant(
                Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodStart()), 
                ZoneId.systemDefault()));
        subscription.setCurrentPeriodEnd(LocalDateTime.ofInstant(
                Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd()), 
                ZoneId.systemDefault()));

        if (stripeSubscription.getTrialStart() != null) {
            subscription.setTrialStart(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(stripeSubscription.getTrialStart()), 
                    ZoneId.systemDefault()));
        }
        if (stripeSubscription.getTrialEnd() != null) {
            subscription.setTrialEnd(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(stripeSubscription.getTrialEnd()), 
                    ZoneId.systemDefault()));
        }

        subscription.setCancelAtPeriodEnd(stripeSubscription.getCancelAtPeriodEnd());
        
        if (stripeSubscription.getCanceledAt() != null) {
            subscription.setCanceledAt(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(stripeSubscription.getCanceledAt()), 
                    ZoneId.systemDefault()));
        }

        // Set plan limits
        int assetLimit = stripeConfig.getAssetLimit(subscription.getPlanName().name());
        int userLimit = stripeConfig.getUserLimit(subscription.getPlanName().name());
        subscription.setAssetLimit(assetLimit);
        subscription.setUserLimit(userLimit);

        return subscription;
    }

    /**
     * Map Stripe status to local enum
     */
    private com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus mapStripeStatus(String status) {
        return switch (status.toLowerCase()) {
            case "active" -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.ACTIVE;
            case "trialing" -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.TRIALING;
            case "past_due" -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.PAST_DUE;
            case "canceled" -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.CANCELED;
            case "unpaid" -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.UNPAID;
            case "incomplete" -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.INCOMPLETE;
            case "incomplete_expired" -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.INCOMPLETE_EXPIRED;
            default -> com.chaseelkins.assetmanagement.model.Subscription.SubscriptionStatus.ACTIVE;
        };
    }
}
