package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.model.Invoice;
import com.chaseelkins.assetmanagement.model.Subscription;
import com.chaseelkins.assetmanagement.repository.InvoiceRepository;
import com.chaseelkins.assetmanagement.repository.SubscriptionRepository;
import com.chaseelkins.assetmanagement.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@RestController
@RequestMapping("/webhooks/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final StripeService stripeService;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid webhook signature", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        log.info("Received Stripe webhook event: {}", event.getType());

        try {
            switch (event.getType()) {
                // Subscription events
                case "customer.subscription.created":
                    handleSubscriptionCreated(event);
                    break;
                case "customer.subscription.updated":
                    handleSubscriptionUpdated(event);
                    break;
                case "customer.subscription.deleted":
                    handleSubscriptionDeleted(event);
                    break;
                case "customer.subscription.trial_will_end":
                    handleTrialWillEnd(event);
                    break;

                // Invoice events
                case "invoice.created":
                    handleInvoiceCreated(event);
                    break;
                case "invoice.payment_succeeded":
                    handleInvoicePaymentSucceeded(event);
                    break;
                case "invoice.payment_failed":
                    handleInvoicePaymentFailed(event);
                    break;
                case "invoice.finalized":
                    handleInvoiceFinalized(event);
                    break;

                // Payment events
                case "payment_intent.succeeded":
                    handlePaymentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentFailed(event);
                    break;

                // Payment method events
                case "payment_method.attached":
                    handlePaymentMethodAttached(event);
                    break;

                default:
                    log.info("Unhandled event type: {}", event.getType());
            }

            return ResponseEntity.ok("Webhook handled successfully");

        } catch (Exception e) {
            log.error("Error handling webhook event: {}", event.getType(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing webhook");
        }
    }

    private void handleSubscriptionCreated(Event event) {
        com.stripe.model.Subscription stripeSubscription = deserializeSubscription(event);
        if (stripeSubscription == null) return;

        log.info("Subscription created: {}", stripeSubscription.getId());

        // Subscription will be created by the API endpoint, just log here
    }

    private void handleSubscriptionUpdated(Event event) {
        com.stripe.model.Subscription stripeSubscription = deserializeSubscription(event);
        if (stripeSubscription == null) return;

        log.info("Subscription updated: {}", stripeSubscription.getId());

        subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId())
                .ifPresent(subscription -> {
                    // Update subscription status
                    subscription.setStatus(mapStripeStatus(stripeSubscription.getStatus()));
                    subscription.setCancelAtPeriodEnd(stripeSubscription.getCancelAtPeriodEnd());

                    subscription.setCurrentPeriodStart(LocalDateTime.ofInstant(
                            Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodStart()),
                            ZoneId.systemDefault()));
                    subscription.setCurrentPeriodEnd(LocalDateTime.ofInstant(
                            Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd()),
                            ZoneId.systemDefault()));

                    if (stripeSubscription.getCanceledAt() != null) {
                        subscription.setCanceledAt(LocalDateTime.ofInstant(
                                Instant.ofEpochSecond(stripeSubscription.getCanceledAt()),
                                ZoneId.systemDefault()));
                    }

                    subscriptionRepository.save(subscription);
                    log.info("Updated subscription {} status to {}", subscription.getId(), subscription.getStatus());
                });
    }

    private void handleSubscriptionDeleted(Event event) {
        com.stripe.model.Subscription stripeSubscription = deserializeSubscription(event);
        if (stripeSubscription == null) return;

        log.info("Subscription deleted: {}", stripeSubscription.getId());

        subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId())
                .ifPresent(subscription -> {
                    subscription.setStatus(Subscription.SubscriptionStatus.CANCELED);
                    subscription.setCanceledAt(LocalDateTime.now());
                    subscriptionRepository.save(subscription);
                    log.info("Marked subscription {} as canceled", subscription.getId());
                });
    }

    private void handleTrialWillEnd(Event event) {
        com.stripe.model.Subscription stripeSubscription = deserializeSubscription(event);
        if (stripeSubscription == null) return;

        log.info("Trial will end soon for subscription: {}", stripeSubscription.getId());

        // TODO: Send email notification to customer about trial ending
        subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId())
                .ifPresent(subscription -> {
                    log.info("Tenant {} trial ends on {}", subscription.getTenantId(), subscription.getTrialEnd());
                    // Implement email notification service here
                });
    }

    private void handleInvoiceCreated(Event event) {
        com.stripe.model.Invoice stripeInvoice = deserializeInvoice(event);
        if (stripeInvoice == null) return;

        log.info("Invoice created: {}", stripeInvoice.getId());

        Invoice invoice = mapStripeInvoiceToEntity(stripeInvoice);
        invoice.setStatus(Invoice.InvoiceStatus.DRAFT);
        invoiceRepository.save(invoice);
    }

    private void handleInvoicePaymentSucceeded(Event event) {
        com.stripe.model.Invoice stripeInvoice = deserializeInvoice(event);
        if (stripeInvoice == null) return;

        log.info("Invoice payment succeeded: {}", stripeInvoice.getId());

        invoiceRepository.findByStripeInvoiceId(stripeInvoice.getId())
                .ifPresentOrElse(
                        invoice -> {
                            invoice.setStatus(Invoice.InvoiceStatus.PAID);
                            invoice.setAmountPaid(BigDecimal.valueOf(stripeInvoice.getAmountPaid() / 100.0));
                            invoice.setPaidAt(LocalDateTime.now());
                            invoiceRepository.save(invoice);
                            log.info("Marked invoice {} as paid", invoice.getId());
                        },
                        () -> {
                            Invoice invoice = mapStripeInvoiceToEntity(stripeInvoice);
                            invoice.setStatus(Invoice.InvoiceStatus.PAID);
                            invoice.setPaidAt(LocalDateTime.now());
                            invoiceRepository.save(invoice);
                        }
                );

        // Update subscription status if needed
        if (stripeInvoice.getSubscription() != null) {
            subscriptionRepository.findByStripeSubscriptionId(stripeInvoice.getSubscription())
                    .ifPresent(subscription -> {
                        if (subscription.getStatus() == Subscription.SubscriptionStatus.PAST_DUE) {
                            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
                            subscriptionRepository.save(subscription);
                            log.info("Reactivated subscription {} after successful payment", subscription.getId());
                        }
                    });
        }
    }

    private void handleInvoicePaymentFailed(Event event) {
        com.stripe.model.Invoice stripeInvoice = deserializeInvoice(event);
        if (stripeInvoice == null) return;

        log.warn("Invoice payment failed: {}", stripeInvoice.getId());

        invoiceRepository.findByStripeInvoiceId(stripeInvoice.getId())
                .ifPresentOrElse(
                        invoice -> {
                            invoice.setStatus(Invoice.InvoiceStatus.OPEN);
                            invoiceRepository.save(invoice);
                        },
                        () -> {
                            Invoice invoice = mapStripeInvoiceToEntity(stripeInvoice);
                            invoice.setStatus(Invoice.InvoiceStatus.OPEN);
                            invoiceRepository.save(invoice);
                        }
                );

        // Update subscription to past_due
        if (stripeInvoice.getSubscription() != null) {
            subscriptionRepository.findByStripeSubscriptionId(stripeInvoice.getSubscription())
                    .ifPresent(subscription -> {
                        subscription.setStatus(Subscription.SubscriptionStatus.PAST_DUE);
                        subscriptionRepository.save(subscription);
                        log.warn("Marked subscription {} as past due", subscription.getId());
                    });
        }

        // TODO: Send email notification about failed payment
    }

    private void handleInvoiceFinalized(Event event) {
        com.stripe.model.Invoice stripeInvoice = deserializeInvoice(event);
        if (stripeInvoice == null) return;

        log.info("Invoice finalized: {}", stripeInvoice.getId());

        invoiceRepository.findByStripeInvoiceId(stripeInvoice.getId())
                .ifPresent(invoice -> {
                    invoice.setInvoicePdfUrl(stripeInvoice.getInvoicePdf());
                    invoice.setHostedInvoiceUrl(stripeInvoice.getHostedInvoiceUrl());
                    invoice.setStatus(Invoice.InvoiceStatus.OPEN);
                    invoiceRepository.save(invoice);
                });
    }

    private void handlePaymentSucceeded(Event event) {
        log.info("Payment succeeded for event: {}", event.getId());
        // Payment success is already handled via invoice.payment_succeeded
    }

    private void handlePaymentFailed(Event event) {
        log.warn("Payment failed for event: {}", event.getId());
        // Payment failure is already handled via invoice.payment_failed
    }

    private void handlePaymentMethodAttached(Event event) {
        log.info("Payment method attached for event: {}", event.getId());
        // Payment method attachment is handled in the API endpoint
    }

    // Helper methods

    private com.stripe.model.Subscription deserializeSubscription(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        if (dataObjectDeserializer.getObject().isEmpty()) {
            log.error("Failed to deserialize subscription from event");
            return null;
        }
        return (com.stripe.model.Subscription) dataObjectDeserializer.getObject().get();
    }

    private com.stripe.model.Invoice deserializeInvoice(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        if (dataObjectDeserializer.getObject().isEmpty()) {
            log.error("Failed to deserialize invoice from event");
            return null;
        }
        return (com.stripe.model.Invoice) dataObjectDeserializer.getObject().get();
    }

    private Invoice mapStripeInvoiceToEntity(com.stripe.model.Invoice stripeInvoice) {
        Invoice invoice = new Invoice();
        invoice.setStripeInvoiceId(stripeInvoice.getId());
        invoice.setStripeSubscriptionId(stripeInvoice.getSubscription());
        invoice.setStripeCustomerId(stripeInvoice.getCustomer());
        invoice.setAmountDue(BigDecimal.valueOf(stripeInvoice.getAmountDue() / 100.0));
        invoice.setAmountPaid(BigDecimal.valueOf(stripeInvoice.getAmountPaid() / 100.0));
        invoice.setCurrency(stripeInvoice.getCurrency());
        invoice.setInvoicePdfUrl(stripeInvoice.getInvoicePdf());
        invoice.setHostedInvoiceUrl(stripeInvoice.getHostedInvoiceUrl());
        invoice.setBillingReason(stripeInvoice.getBillingReason());

        if (stripeInvoice.getPeriodStart() != null) {
            invoice.setPeriodStart(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(stripeInvoice.getPeriodStart()), ZoneId.systemDefault()));
        }

        if (stripeInvoice.getPeriodEnd() != null) {
            invoice.setPeriodEnd(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(stripeInvoice.getPeriodEnd()), ZoneId.systemDefault()));
        }

        if (stripeInvoice.getDueDate() != null) {
            invoice.setDueDate(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(stripeInvoice.getDueDate()), ZoneId.systemDefault()));
        }

        // Extract tenant ID from subscription
        if (stripeInvoice.getSubscription() != null) {
            subscriptionRepository.findByStripeSubscriptionId(stripeInvoice.getSubscription())
                    .ifPresent(subscription -> invoice.setTenantId(subscription.getTenantId()));
        }

        return invoice;
    }

    private Subscription.SubscriptionStatus mapStripeStatus(String status) {
        return switch (status) {
            case "incomplete" -> Subscription.SubscriptionStatus.INCOMPLETE;
            case "incomplete_expired" -> Subscription.SubscriptionStatus.INCOMPLETE_EXPIRED;
            case "trialing" -> Subscription.SubscriptionStatus.TRIALING;
            case "active" -> Subscription.SubscriptionStatus.ACTIVE;
            case "past_due" -> Subscription.SubscriptionStatus.PAST_DUE;
            case "canceled" -> Subscription.SubscriptionStatus.CANCELED;
            case "unpaid" -> Subscription.SubscriptionStatus.UNPAID;
            default -> Subscription.SubscriptionStatus.INCOMPLETE;
        };
    }
}
