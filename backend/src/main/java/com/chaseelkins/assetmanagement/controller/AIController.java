package com.chaseelkins.assetmanagement.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;

/**
 * Minimal deterministic AI-style endpoints (stubbed) to unblock frontend integration.
 * Provides categorization and asset insight scoring without external AI dependencies.
 * Includes a naive in-memory per-user rate limiter (sliding window token bucket hybrid).
 */
@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = {"http://localhost:3000","http://127.0.0.1:3000","http://localhost:5173","http://127.0.0.1:5173"}, allowCredentials = "true")
public class AIController {

    private final Counter categorizeRequests;
    private final Counter insightsRequests;
    private final Counter rateLimitHits;
    private final Timer categorizeLatency;
    private final Timer insightsLatency;

    public AIController(MeterRegistry registry) {
    this.categorizeRequests = Counter.builder("ai_categorize_requests_total")
        .description("Total categorize requests")
        .register(registry);
    this.insightsRequests = Counter.builder("ai_insights_requests_total")
        .description("Total insights requests")
        .register(registry);
    this.rateLimitHits = Counter.builder("ai_rate_limit_hits_total")
        .description("Total AI endpoint rate limit rejections")
        .register(registry);
    this.categorizeLatency = Timer.builder("ai_categorize_latency_ms")
        .description("Latency of categorize endpoint")
        .publishPercentileHistogram()
        .register(registry);
    this.insightsLatency = Timer.builder("ai_insights_latency_ms")
        .description("Latency of insights endpoint")
        .publishPercentileHistogram()
        .register(registry);
    }

    private record CategorizeRequest(@NotBlank @Size(max = 5000) String text) {}
    private record CategorizeResponse(String category, double confidence, List<String> tags, long latencyMs, Instant timestamp) {}

    private record InsightsRequest(@NotBlank @Size(max = 10000) String content) {}
    private record Insight(String key, String value, double score) {}
    private record InsightsResponse(List<Insight> insights, long latencyMs, Instant timestamp) {}

    private static final Set<String> SECURITY_TERMS = Set.of("vuln","patch","risk","encrypt","leak","breach");
    private static final Set<String> MAINT_TERMS = Set.of("battery","repair","maintenance","warranty","replace","degraded");
    private static final Set<String> LICENSE_TERMS = Set.of("license","renew","expiry","subscription","seat");

    // Rate limit: max 30 requests / 5 minutes per user principal for all /ai endpoints combined
    private static final int LIMIT = 30;
    private static final long WINDOW_MS = 5 * 60_000L;

    /** Stores per-user counters & oldest timestamp. */
    private static final Map<String, Window> RATE = new ConcurrentHashMap<>();
    private record Window(AtomicInteger count, long windowStart) {}

    private int remaining(String user, Window w) {
        return Math.max(0, LIMIT - w.count().get());
    }

    private Window getWindow(String user) { return RATE.get(user); }

    private boolean checkRateLimit(String user) {
        long now = System.currentTimeMillis();
        RATE.compute(user, (k, v) -> {
            if (v == null || now - v.windowStart() > WINDOW_MS) {
                return new Window(new AtomicInteger(1), now);
            }
            v.count().incrementAndGet();
            return v;
        });
        Window w = RATE.get(user);
        return w.count().get() <= LIMIT;
    }

    private String currentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return "anonymous";
        return auth.getName();
    }

    @PostMapping("/categorize")
    @PreAuthorize("hasAnyRole('USER','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<?> categorize(@Valid @RequestBody CategorizeRequest request) {
        long start = System.nanoTime();
        String user = currentUser();
        boolean allowed = checkRateLimit(user);
        Window w = getWindow(user);
        if (!allowed) {
            rateLimitHits.increment();
            long resetInMs = (w.windowStart() + WINDOW_MS) - System.currentTimeMillis();
            long retryAfterSec = Math.max(1, resetInMs / 1000);
            return ResponseEntity.status(429)
                    .header("Retry-After", String.valueOf(retryAfterSec))
                    .header("X-RateLimit-Limit", String.valueOf(LIMIT))
                    .header("X-RateLimit-Remaining", "0")
                    .header("X-RateLimit-Reset", String.valueOf((w.windowStart()+WINDOW_MS)/1000))
                    .body(Map.of("error","Rate limit exceeded. Try again later."));
        }
        // allowed
        int remaining = remaining(user, w);
        categorizeRequests.increment();
        String lower = request.text().toLowerCase(Locale.ROOT);
        String category = "GENERAL";
        double confidence = 0.55;
        if (containsAny(lower, SECURITY_TERMS)) { category = "SECURITY"; confidence = 0.88; }
        else if (containsAny(lower, MAINT_TERMS)) { category = "MAINTENANCE"; confidence = 0.82; }
        else if (containsAny(lower, LICENSE_TERMS)) { category = "LICENSING"; confidence = 0.80; }

        List<String> tags = new ArrayList<>();
        SECURITY_TERMS.stream().filter(lower::contains).forEach(t -> tags.add("sec:" + t));
        MAINT_TERMS.stream().filter(lower::contains).forEach(t -> tags.add("maint:" + t));
        LICENSE_TERMS.stream().filter(lower::contains).forEach(t -> tags.add("lic:" + t));
        if (tags.isEmpty()) tags.add("general");

        long latencyMs = (System.nanoTime() - start) / 1_000_000L;
        categorizeLatency.record(System.nanoTime() - start, java.util.concurrent.TimeUnit.NANOSECONDS);
    return ResponseEntity.ok()
        .header("X-RateLimit-Limit", String.valueOf(LIMIT))
        .header("X-RateLimit-Remaining", String.valueOf(remaining))
        .header("X-RateLimit-Reset", String.valueOf((w.windowStart()+WINDOW_MS)/1000))
        .body(new CategorizeResponse(category, confidence, tags, latencyMs, Instant.now()));
    }

    @PostMapping("/insights")
    @PreAuthorize("hasAnyRole('USER','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<?> insights(@Valid @RequestBody InsightsRequest request) {
        long start = System.nanoTime();
        String user = currentUser();
        boolean allowed = checkRateLimit(user);
        Window w = getWindow(user);
        if (!allowed) {
            rateLimitHits.increment();
            long resetInMs = (w.windowStart() + WINDOW_MS) - System.currentTimeMillis();
            long retryAfterSec = Math.max(1, resetInMs / 1000);
            return ResponseEntity.status(429)
                    .header("Retry-After", String.valueOf(retryAfterSec))
                    .header("X-RateLimit-Limit", String.valueOf(LIMIT))
                    .header("X-RateLimit-Remaining", "0")
                    .header("X-RateLimit-Reset", String.valueOf((w.windowStart()+WINDOW_MS)/1000))
                    .body(Map.of("error","Rate limit exceeded. Try again later."));
        }
        int remaining = remaining(user, w);
        insightsRequests.increment();
        String lower = request.content().toLowerCase(Locale.ROOT);

        List<Insight> insights = new ArrayList<>();
        insights.add(new Insight("length", String.valueOf(request.content().length()), clampScore(request.content().length() / 5000.0)));
        insights.add(new Insight("security_mentions", String.valueOf(countMatches(lower, SECURITY_TERMS)), clampScore(countMatches(lower, SECURITY_TERMS) / 5.0)));
        insights.add(new Insight("maintenance_mentions", String.valueOf(countMatches(lower, MAINT_TERMS)), clampScore(countMatches(lower, MAINT_TERMS) / 5.0)));
        insights.add(new Insight("licensing_mentions", String.valueOf(countMatches(lower, LICENSE_TERMS)), clampScore(countMatches(lower, LICENSE_TERMS) / 5.0)));
        insights.add(new Insight("distinct_tags", String.valueOf(distinctMentions(lower)), clampScore(distinctMentions(lower) / 10.0)));

        long latencyMs = (System.nanoTime() - start) / 1_000_000L;
        insightsLatency.record(System.nanoTime() - start, java.util.concurrent.TimeUnit.NANOSECONDS);
    return ResponseEntity.ok()
        .header("X-RateLimit-Limit", String.valueOf(LIMIT))
        .header("X-RateLimit-Remaining", String.valueOf(remaining))
        .header("X-RateLimit-Reset", String.valueOf((w.windowStart()+WINDOW_MS)/1000))
        .body(new InsightsResponse(insights, latencyMs, Instant.now()));
    }

    private static boolean containsAny(String text, Set<String> terms) {
        for (String t : terms) if (text.contains(t)) return true; return false;
    }
    private static int countMatches(String text, Set<String> terms) {
        int c = 0; for (String t : terms) if (text.contains(t)) c++; return c;
    }
    private static int distinctMentions(String text) {
        Set<String> all = new HashSet<>();
        all.addAll(SECURITY_TERMS); all.addAll(MAINT_TERMS); all.addAll(LICENSE_TERMS);
        int c = 0; for (String t : all) if (text.contains(t)) c++; return c;
    }
    private static double clampScore(double v) { return Math.max(0.0, Math.min(1.0, Math.round(v * 100.0) / 100.0)); }
}
