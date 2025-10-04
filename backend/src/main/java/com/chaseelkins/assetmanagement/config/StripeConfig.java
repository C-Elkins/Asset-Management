package com.chaseelkins.assetmanagement.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Configuration
@Getter
public class StripeConfig {

    @Value("${stripe.api-key}")
    private String apiKey;

    @Value("${stripe.publishable-key}")
    private String publishableKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    // Bind as raw string to avoid SpEL map placeholder resolution issues
    // Expected format in YAML flattens to keys under stripe.price-ids.* which we will parse
    @Value("${stripe.price-ids:}")
    private String priceIdsRaw;

    @Value("${stripe.plans:}")
    private String plansRaw;

    private Map<String, String> priceIds = new HashMap<>();
    private Map<String, Map<String, Integer>> plans = new HashMap<>();

    @PostConstruct
    public void init() {
        Stripe.apiKey = this.apiKey;
        // Attempt to parse raw properties if present; fall back to sensible defaults
        // Note: When using YAML, Spring does not expose the nested map as a single placeholder string reliably.
        // We'll rely on environment variables for price IDs when available; otherwise keep empty maps.
        if (Objects.nonNull(priceIdsRaw) && !priceIdsRaw.isBlank()) {
            // No-op: reserved for potential future parsing of inline map strings
        }
        if (Objects.nonNull(plansRaw) && !plansRaw.isBlank()) {
            // No-op: plans defaults handled in getters if not provided
        }
    }

    public String getPriceId(String planKey) {
        return priceIds.get(planKey);
    }

    public Map<String, Integer> getPlanLimits(String planName) {
        return plans.get(planName);
    }

    public int getAssetLimit(String planName) {
        Map<String, Integer> limits = plans.get(planName);
        return limits != null ? limits.getOrDefault("asset-limit", 50) : 50;
    }

    public int getUserLimit(String planName) {
        Map<String, Integer> limits = plans.get(planName);
        return limits != null ? limits.getOrDefault("user-limit", 3) : 3;
    }
}
