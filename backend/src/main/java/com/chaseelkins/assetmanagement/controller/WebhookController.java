package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.WebhookDTO;
import com.chaseelkins.assetmanagement.model.Webhook;
import com.chaseelkins.assetmanagement.service.WebhookService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/webhooks")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<WebhookDTO.WebhookResponse>> getAllWebhooks() {
        List<Webhook> webhooks = webhookService.getAllWebhooks();
        List<WebhookDTO.WebhookResponse> response = webhooks.stream()
            .map(webhookService::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<WebhookDTO.WebhookResponse> getWebhook(@PathVariable Long id) {
        Webhook webhook = webhookService.getWebhookById(id);
        return ResponseEntity.ok(webhookService.toDTO(webhook));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<WebhookDTO.WebhookResponse> createWebhook(
            @Valid @RequestBody WebhookDTO.WebhookRequest request) {
        Webhook webhook = webhookService.createWebhook(request);
        return ResponseEntity.ok(webhookService.toDTO(webhook));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<WebhookDTO.WebhookResponse> updateWebhook(
            @PathVariable Long id,
            @Valid @RequestBody WebhookDTO.WebhookRequest request) {
        Webhook webhook = webhookService.updateWebhook(id, request);
        return ResponseEntity.ok(webhookService.toDTO(webhook));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteWebhook(@PathVariable Long id) {
        webhookService.deleteWebhook(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/test")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<WebhookDTO.WebhookTestResult> testWebhook(@PathVariable Long id) {
        WebhookDTO.WebhookTestResult result = webhookService.testWebhook(id);
        return ResponseEntity.ok(result);
    }
}
