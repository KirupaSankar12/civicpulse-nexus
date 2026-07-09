package com.civicpulse.service_management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID appId;

    @Column(nullable = false)
    private UUID citizenId;

    @Column(nullable = false)
    private String applicantName;

    @Column(nullable = false)
    private String type; // BIRTH_CERTIFICATE, DEATH_CERTIFICATE, INCOME_CERTIFICATE, RESIDENCE_CERTIFICATE, TRADE_LICENSE

    @Column(nullable = false)
    private String status; // SUBMITTED, VERIFIED, APPROVED, REJECTED, GENERATED

    @Column(columnDefinition = "TEXT")
    private String detailsJson; // JSON representation of fields like childName, dob, hospital, income, businessName, etc.

    private String documentUrl; // URL of uploaded proof/document

    private String assignedOfficer;

    private String remarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
