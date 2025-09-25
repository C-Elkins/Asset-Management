package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.RefreshToken;
import com.chaseelkins.assetmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String tokenHash);
    List<RefreshToken> findAllByUserAndRevokedAtIsNull(User user);
}
