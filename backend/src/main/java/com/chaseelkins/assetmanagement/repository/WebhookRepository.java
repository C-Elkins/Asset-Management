package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.Webhook;
import com.chaseelkins.assetmanagement.model.Webhook.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, Long> {
    
    List<Webhook> findByActiveTrue();
    
    List<Webhook> findByActiveTrueAndEventsContaining(WebhookEvent event);
}
