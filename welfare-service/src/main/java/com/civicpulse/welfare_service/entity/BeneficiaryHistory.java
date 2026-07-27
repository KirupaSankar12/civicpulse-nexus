package com.civicpulse.welfare_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "beneficiary_history")
public class BeneficiaryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID historyId;

    private UUID beneficiaryId;

    @Enumerated(EnumType.STRING)
    private BeneficiaryStatus previousStatus;

    @Enumerated(EnumType.STRING)
    private BeneficiaryStatus newStatus;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (this.timestamp == null) this.timestamp = LocalDateTime.now();
    }

    public BeneficiaryHistory() {}

    public BeneficiaryHistory(UUID beneficiaryId, BeneficiaryStatus previousStatus,
                               BeneficiaryStatus newStatus, String remarks) {
        this.beneficiaryId = beneficiaryId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.remarks = remarks;
        this.timestamp = LocalDateTime.now();
    }

    public UUID getHistoryId() { return historyId; }
    public void setHistoryId(UUID historyId) { this.historyId = historyId; }

    public UUID getBeneficiaryId() { return beneficiaryId; }
    public void setBeneficiaryId(UUID beneficiaryId) { this.beneficiaryId = beneficiaryId; }

    public BeneficiaryStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(BeneficiaryStatus previousStatus) { this.previousStatus = previousStatus; }

    public BeneficiaryStatus getNewStatus() { return newStatus; }
    public void setNewStatus(BeneficiaryStatus newStatus) { this.newStatus = newStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
