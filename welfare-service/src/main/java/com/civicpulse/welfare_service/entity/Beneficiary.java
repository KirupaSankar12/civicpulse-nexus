package com.civicpulse.welfare_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "beneficiaries")
public class Beneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID beneficiaryId;

    @Column(unique = true)
    private String beneficiaryCode;

    @NotBlank(message = "citizenId is required")
    private String citizenId;

    @NotNull(message = "schemeId is required")
    private UUID schemeId;

    @NotBlank(message = "applicantName is required")
    private String applicantName;

    @NotBlank(message = "applicantAadhaar is required")
    @Pattern(regexp = "^\\d{4}-\\d{4}-\\d{4}$", message = "Aadhaar must be in format XXXX-XXXX-XXXX")
    private String applicantAadhaar;

    private BigDecimal annualIncome;
    private Integer age;

    @Column(columnDefinition = "TEXT")
    private String familyStatus;

    @Column(columnDefinition = "TEXT")
    private String documentsSubmitted;

    @Enumerated(EnumType.STRING)
    private EligibilityStatus eligibilityStatus;

    @Enumerated(EnumType.STRING)
    private BeneficiaryStatus status;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime appliedDate;
    private LocalDateTime approvedDate;

    @PrePersist
    public void prePersist() {
        if (this.status == null) this.status = BeneficiaryStatus.APPLIED;
        if (this.eligibilityStatus == null) this.eligibilityStatus = EligibilityStatus.PENDING_CHECK;
        if (this.appliedDate == null) this.appliedDate = LocalDateTime.now();
    }

    public Beneficiary() {}

    public UUID getBeneficiaryId() { return beneficiaryId; }
    public void setBeneficiaryId(UUID beneficiaryId) { this.beneficiaryId = beneficiaryId; }

    public String getBeneficiaryCode() { return beneficiaryCode; }
    public void setBeneficiaryCode(String beneficiaryCode) { this.beneficiaryCode = beneficiaryCode; }

    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

    public UUID getSchemeId() { return schemeId; }
    public void setSchemeId(UUID schemeId) { this.schemeId = schemeId; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getApplicantAadhaar() { return applicantAadhaar; }
    public void setApplicantAadhaar(String applicantAadhaar) { this.applicantAadhaar = applicantAadhaar; }

    public BigDecimal getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(BigDecimal annualIncome) { this.annualIncome = annualIncome; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getFamilyStatus() { return familyStatus; }
    public void setFamilyStatus(String familyStatus) { this.familyStatus = familyStatus; }

    public String getDocumentsSubmitted() { return documentsSubmitted; }
    public void setDocumentsSubmitted(String documentsSubmitted) { this.documentsSubmitted = documentsSubmitted; }

    public EligibilityStatus getEligibilityStatus() { return eligibilityStatus; }
    public void setEligibilityStatus(EligibilityStatus eligibilityStatus) { this.eligibilityStatus = eligibilityStatus; }

    public BeneficiaryStatus getStatus() { return status; }
    public void setStatus(BeneficiaryStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }

    public LocalDateTime getApprovedDate() { return approvedDate; }
    public void setApprovedDate(LocalDateTime approvedDate) { this.approvedDate = approvedDate; }
}
