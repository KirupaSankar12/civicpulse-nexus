package com.civicpulse.service_management.controller;

import com.civicpulse.service_management.entity.IssuedCertificate;
import com.civicpulse.service_management.entity.ServiceApplication;
import com.civicpulse.service_management.repository.IssuedCertificateRepository;
import com.civicpulse.service_management.repository.ServiceApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/services")
public class ServiceManagementController {

    private final ServiceApplicationRepository applicationRepository;
    private final IssuedCertificateRepository certificateRepository;

    public ServiceManagementController(ServiceApplicationRepository applicationRepository,
                                       IssuedCertificateRepository certificateRepository) {
        this.applicationRepository = applicationRepository;
        this.certificateRepository = certificateRepository;
    }

    @PostMapping("/apply")
    public ResponseEntity<ServiceApplication> applyForService(@RequestBody ServiceApplication app) {
        app.setStatus("SUBMITTED");
        return ResponseEntity.ok(applicationRepository.save(app));
    }

    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<List<ServiceApplication>> getCitizenApplications(@PathVariable UUID citizenId) {
        return ResponseEntity.ok(applicationRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ServiceApplication>> getPendingApplications() {
        return ResponseEntity.ok(applicationRepository.findByStatusOrderByCreatedAtDesc("SUBMITTED"));
    }

    @GetMapping("/verified-pending")
    public ResponseEntity<List<ServiceApplication>> getVerifiedPendingApplications() {
        return ResponseEntity.ok(applicationRepository.findByStatusOrderByCreatedAtDesc("VERIFIED"));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ServiceApplication> verifyApplication(
            @PathVariable UUID id,
            @RequestParam String officer,
            @RequestParam(required = false) String remarks) {
        
        return applicationRepository.findById(id)
                .map(app -> {
                    app.setStatus("VERIFIED");
                    app.setAssignedOfficer(officer);
                    if (remarks != null) {
                        app.setRemarks(remarks);
                    }
                    return ResponseEntity.ok(applicationRepository.save(app));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ServiceApplication> approveApplication(
            @PathVariable UUID id,
            @RequestParam String officer,
            @RequestParam(required = false) String remarks) {

        return applicationRepository.findById(id)
                .map(app -> {
                    app.setStatus("GENERATED");
                    app.setAssignedOfficer(officer);
                    if (remarks != null) {
                        app.setRemarks(remarks);
                    }
                    ServiceApplication savedApp = applicationRepository.save(app);

                    // Generate Certificate
                    String prefix = getPrefix(savedApp.getType());
                    String certNum = prefix + "-" + LocalDateTime.now().getYear() + "-" + (1000 + new Random().nextInt(9000));
                    
                    LocalDateTime expiry = null;
                    if ("TRADE_LICENSE".equals(savedApp.getType())) {
                        expiry = LocalDateTime.now().plusYears(1);
                    }

                    IssuedCertificate cert = IssuedCertificate.builder()
                            .appId(savedApp.getAppId())
                            .certificateNumber(certNum)
                            .issuedTo(savedApp.getApplicantName())
                            .type(savedApp.getType())
                            .issuedDate(LocalDateTime.now())
                            .expiryDate(expiry)
                            .signatureSeal(generateSeal(certNum, savedApp.getAppId(), savedApp.getApplicantName()))
                            .downloadCount(0)
                            .build();

                    certificateRepository.save(cert);

                    return ResponseEntity.ok(savedApp);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/certificate/{appId}")
    public ResponseEntity<IssuedCertificate> getCertificate(@PathVariable UUID appId) {
        return certificateRepository.findByAppId(appId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/certificate/{id}/download")
    public ResponseEntity<IssuedCertificate> trackDownload(@PathVariable UUID id) {
        return certificateRepository.findById(id)
                .map(cert -> {
                    cert.setDownloadCount(cert.getDownloadCount() + 1);
                    return ResponseEntity.ok(certificateRepository.save(cert));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String getPrefix(String type) {
        return switch (type) {
            case "BIRTH_CERTIFICATE" -> "BC";
            case "DEATH_CERTIFICATE" -> "DC";
            case "INCOME_CERTIFICATE" -> "IC";
            case "RESIDENCE_CERTIFICATE" -> "RC";
            case "TRADE_LICENSE" -> "TL";
            default -> "CERT";
        };
    }

    private String generateSeal(String certificateNumber, UUID appId, String name) {
        try {
            String input = certificateNumber + ":" + appId.toString() + ":" + name + ":OFFICIAL_MUNICIPAL_SEAL";
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return "SECURE_MUNICIPAL_SEAL_VERIFICATION:" + hexString.toString().toUpperCase().substring(0, 32);
        } catch (Exception e) {
            return "SECURE_MUNICIPAL_SEAL_VERIFICATION:FALLBACK_" + UUID.randomUUID().toString().replace("-", "").toUpperCase().substring(0, 20);
        }
    }
}
