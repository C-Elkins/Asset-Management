package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    
    List<PaymentMethod> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    
    List<PaymentMethod> findByStripeCustomerId(String stripeCustomerId);
    
    Optional<PaymentMethod> findByStripePaymentMethodId(String stripePaymentMethodId);
    
    Optional<PaymentMethod> findByTenantIdAndIsDefaultTrue(Long tenantId);
}
