package com.chaseelkins.assetmanagement.controller;

import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.CompositeHealth;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lightweight health endpoint that reports overall UP even if only the mail component is DOWN.
 * This allows the frontend login UI to rely on a stable readiness signal that ignores
 * non-critical subsystems during development (or partial outages) while the core API is functional.
 */
@RestController
@RequestMapping("/api/v1")
public class HealthzController {

    private final HealthEndpoint healthEndpoint;

    public HealthzController(HealthEndpoint healthEndpoint) {
        this.healthEndpoint = healthEndpoint;
    }

    @GetMapping("/healthz")
    public ResponseEntity<Map<String, Object>> healthz() {
        HealthComponent root = healthEndpoint.health();
        Status overall = root.getStatus();

        // Collect component statuses if composite
        Map<String, Object> components = new LinkedHashMap<>();
        if (root instanceof CompositeHealth composite) {
            composite.getComponents().forEach((name, hc) -> {
                components.put(name, Map.of(
                        "status", hc.getStatus().getCode()
                ));
            });
            // Determine if only mail is down
            boolean anyNonMailDown = composite.getComponents().entrySet().stream()
                    .anyMatch(e -> !e.getKey().equalsIgnoreCase("mail") && !Status.UP.equals(e.getValue().getStatus()));
            boolean mailDown = composite.getComponents().entrySet().stream()
                    .anyMatch(e -> e.getKey().equalsIgnoreCase("mail") && !Status.UP.equals(e.getValue().getStatus()));
            if (mailDown && !anyNonMailDown) {
                overall = Status.UP; // Treat as overall UP for readiness
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", overall.getCode());
        body.put("timestamp", Instant.now().toString());
        body.put("components", components); // intentionally minimal
        body.put("_note", "/healthz treats mail-only failures as UP");
        return ResponseEntity.ok(body);
    }
}
