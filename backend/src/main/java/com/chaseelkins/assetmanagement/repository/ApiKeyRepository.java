package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    
    Optional<ApiKey> findByPrefix(String prefix);
    
    List<ApiKey> findByUserId(Long userId);
    
    List<ApiKey> findByUserIdAndActiveTrue(Long userId);
    
    boolean existsByName(String name);
    
    boolean existsByPrefix(String prefix);
}
