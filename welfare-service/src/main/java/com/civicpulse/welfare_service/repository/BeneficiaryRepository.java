package com.civicpulse.welfare_service.repository;

import com.civicpulse.welfare_service.entity.Beneficiary;
import com.civicpulse.welfare_service.entity.BeneficiaryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID> {
    List<Beneficiary> findByCitizenId(String citizenId);
    List<Beneficiary> findBySchemeId(UUID schemeId);
    List<Beneficiary> findByStatus(BeneficiaryStatus status);
    List<Beneficiary> findByStatusIn(List<BeneficiaryStatus> statuses);
    
    java.util.Optional<Beneficiary> findFirstBySchemeIdAndApplicantAadhaarAndStatusIn(UUID schemeId, String applicantAadhaar, List<BeneficiaryStatus> statuses);
    long countBySchemeId(UUID schemeId);

    @Query("SELECT MAX(CAST(SUBSTRING(b.beneficiaryCode, 10) AS integer)) FROM Beneficiary b WHERE b.beneficiaryCode LIKE CONCAT('BEN-', :year, '-%')")
    Long findMaxSequenceForYear(int year);
}
