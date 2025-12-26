package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Optional<Invoice> findByStripeInvoiceId(String stripeInvoiceId);
    
    Page<Invoice> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);
    
    Page<Invoice> findByStripeCustomerIdOrderByCreatedAtDesc(String stripeCustomerId, Pageable pageable);
}
