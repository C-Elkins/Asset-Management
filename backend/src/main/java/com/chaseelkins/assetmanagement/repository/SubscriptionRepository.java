package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    Optional<Subscription> findByTenantId(Long tenantId);
    
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
    
    Optional<Subscription> findByStripeCustomerId(String stripeCustomerId);
    
    boolean existsByTenantIdAndStatus(Long tenantId, Subscription.SubscriptionStatus status);
}
