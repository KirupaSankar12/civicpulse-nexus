package com.civicpulse.service_management.repository;

import com.civicpulse.service_management.entity.IssuedCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface IssuedCertificateRepository extends JpaRepository<IssuedCertificate, UUID> {
    Optional<IssuedCertificate> findByAppId(UUID appId);
    Optional<IssuedCertificate> findByCertificateNumber(String certificateNumber);
}
