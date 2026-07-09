package com.civicpulse.service_management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "issued_certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssuedCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID certificateId;

    @Column(nullable = false)
    private UUID appId;

    @Column(nullable = false, unique = true)
    private String certificateNumber;

    @Column(nullable = false)
    private String issuedTo;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private LocalDateTime issuedDate;

    private LocalDateTime expiryDate;

    @Column(columnDefinition = "TEXT")
    private String signatureSeal;

    private int downloadCount;
}
