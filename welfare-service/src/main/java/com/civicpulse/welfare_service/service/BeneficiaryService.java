package com.civicpulse.welfare_service.service;

import com.civicpulse.welfare_service.entity.*;
import com.civicpulse.welfare_service.event.WelfareEvent;
import com.civicpulse.welfare_service.repository.BeneficiaryHistoryRepository;
import com.civicpulse.welfare_service.repository.BeneficiaryRepository;
import com.civicpulse.welfare_service.repository.WelfareSchemeRepository;
import com.civicpulse.welfare_service.util.BeneficiaryCodeGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import com.civicpulse.welfare_service.exception.DuplicateApplicationException;

@Service
public class BeneficiaryService {
    private static final Logger log = LoggerFactory.getLogger(BeneficiaryService.class);

    // ── Status Transition Rules ─────────────────────────────────────────────
    private static final Map<BeneficiaryStatus, EnumSet<BeneficiaryStatus>> ALLOWED_TRANSITIONS =
            new EnumMap<>(BeneficiaryStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(BeneficiaryStatus.APPLIED,
                EnumSet.of(BeneficiaryStatus.UNDER_REVIEW));
        ALLOWED_TRANSITIONS.put(BeneficiaryStatus.UNDER_REVIEW,
                EnumSet.of(BeneficiaryStatus.APPROVED, BeneficiaryStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(BeneficiaryStatus.APPROVED,
                EnumSet.of(BeneficiaryStatus.FUNDS_DISBURSED));
        // REJECTED and FUNDS_DISBURSED are terminal — no outbound transitions
        ALLOWED_TRANSITIONS.put(BeneficiaryStatus.REJECTED, EnumSet.noneOf(BeneficiaryStatus.class));
        ALLOWED_TRANSITIONS.put(BeneficiaryStatus.FUNDS_DISBURSED, EnumSet.noneOf(BeneficiaryStatus.class));
    }

    private final BeneficiaryRepository beneficiaryRepo;
    private final BeneficiaryHistoryRepository historyRepo;
    private final WelfareSchemeRepository schemeRepo;
    private final BeneficiaryCodeGenerator codeGenerator;
    private final WelfareEventPublisher eventPublisher;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepo,
                               BeneficiaryHistoryRepository historyRepo,
                               WelfareSchemeRepository schemeRepo,
                               BeneficiaryCodeGenerator codeGenerator,
                               WelfareEventPublisher eventPublisher) {
        this.beneficiaryRepo = beneficiaryRepo;
        this.historyRepo = historyRepo;
        this.schemeRepo = schemeRepo;
        this.codeGenerator = codeGenerator;
        this.eventPublisher = eventPublisher;
    }

    // ── Apply for a scheme ──────────────────────────────────────────────────
    @Transactional
    public Beneficiary apply(UUID schemeId, Beneficiary beneficiary) {
        WelfareScheme scheme = schemeRepo.findById(schemeId)
                .orElseThrow(() -> new IllegalArgumentException("Scheme not found: " + schemeId));

        if (scheme.getStatus() != SchemeStatus.ACTIVE) {
            throw new IllegalStateException("Cannot apply to a scheme that is not ACTIVE");
        }

        // Enforce Single Active Application Rule
        List<BeneficiaryStatus> activeStatuses = Arrays.asList(
                BeneficiaryStatus.APPLIED, BeneficiaryStatus.UNDER_REVIEW, BeneficiaryStatus.APPROVED
        );
        Optional<Beneficiary> existing = beneficiaryRepo.findFirstBySchemeIdAndApplicantAadhaarAndStatusIn(
                schemeId, beneficiary.getApplicantAadhaar(), activeStatuses
        );
        if (existing.isPresent()) {
            throw new DuplicateApplicationException("You already have an active application for this welfare scheme.", existing.get());
        }

        beneficiary.setSchemeId(schemeId);
        beneficiary.setBeneficiaryCode(codeGenerator.generate());

        // Automated eligibility check
        boolean incomeOk = (scheme.getMinIncome() == null || beneficiary.getAnnualIncome() == null ||
                            beneficiary.getAnnualIncome().compareTo(scheme.getMinIncome()) >= 0)
                        && (scheme.getMaxIncome() == null || beneficiary.getAnnualIncome() == null ||
                            beneficiary.getAnnualIncome().compareTo(scheme.getMaxIncome()) <= 0);
        boolean ageOk = (scheme.getMinAge() == null || beneficiary.getAge() == null ||
                         beneficiary.getAge() >= scheme.getMinAge())
                     && (scheme.getMaxAge() == null || beneficiary.getAge() == null ||
                         beneficiary.getAge() <= scheme.getMaxAge());

        boolean eligible = incomeOk && ageOk;
        beneficiary.setEligibilityStatus(eligible ? EligibilityStatus.ELIGIBLE : EligibilityStatus.NOT_ELIGIBLE);

        Beneficiary saved = beneficiaryRepo.save(beneficiary);
        log.info("Eligibility check: incomeOk={}, ageOk={} → status={}", incomeOk, ageOk, saved.getEligibilityStatus());

        // Publish event
        eventPublisher.publishApplied(toEvent("BENEFICIARY_APPLIED", saved, scheme.getSchemeName(), null));
        return saved;
    }

    // ── Move to UNDER_REVIEW ────────────────────────────────────────────────
    @Transactional
    public Beneficiary moveToUnderReview(UUID beneficiaryId, String remarks) {
        Beneficiary b = getById(beneficiaryId);
        transition(b, BeneficiaryStatus.UNDER_REVIEW, remarks);
        Beneficiary saved = beneficiaryRepo.save(b);
        String schemeName = schemeRepo.findById(b.getSchemeId())
                .map(WelfareScheme::getSchemeName).orElse("Unknown");
        eventPublisher.publishVerified(toEvent("BENEFICIARY_VERIFIED", saved, schemeName, remarks));
        return saved;
    }

    // ── Approve ─────────────────────────────────────────────────────────────
    @Transactional
    public Beneficiary approve(UUID beneficiaryId, String remarks) {
        Beneficiary b = getById(beneficiaryId);
        transition(b, BeneficiaryStatus.APPROVED, remarks);
        b.setApprovedDate(LocalDateTime.now());
        Beneficiary saved = beneficiaryRepo.save(b);

        // Increment beneficiaryCount on scheme
        schemeRepo.findById(b.getSchemeId()).ifPresent(scheme -> {
            scheme.setBeneficiaryCount(scheme.getBeneficiaryCount() + 1);
            schemeRepo.save(scheme);
        });

        String schemeName = schemeRepo.findById(b.getSchemeId())
                .map(WelfareScheme::getSchemeName).orElse("Unknown");
        eventPublisher.publishApproved(toEvent("BENEFICIARY_APPROVED", saved, schemeName, remarks));
        return saved;
    }

    // ── Reject ──────────────────────────────────────────────────────────────
    @Transactional
    public Beneficiary reject(UUID beneficiaryId, String reason) {
        Beneficiary b = getById(beneficiaryId);
        transition(b, BeneficiaryStatus.REJECTED, reason);
        b.setRejectionReason(reason);
        Beneficiary saved = beneficiaryRepo.save(b);

        String schemeName = schemeRepo.findById(b.getSchemeId())
                .map(WelfareScheme::getSchemeName).orElse("Unknown");
        eventPublisher.publishRejected(toEvent("BENEFICIARY_REJECTED", saved, schemeName, reason));
        return saved;
    }

    // ── Query methods ────────────────────────────────────────────────────────
    public Beneficiary getById(UUID id) {
        return beneficiaryRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary not found: " + id));
    }

    public List<Beneficiary> getByCitizenId(String citizenId) {
        return beneficiaryRepo.findByCitizenId(citizenId);
    }

    public List<Beneficiary> getPending() {
        return beneficiaryRepo.findByStatusIn(
                List.of(BeneficiaryStatus.APPLIED, BeneficiaryStatus.UNDER_REVIEW));
    }

    public List<BeneficiaryHistory> getHistory(UUID beneficiaryId) {
        return historyRepo.findByBeneficiaryIdOrderByTimestampAsc(beneficiaryId);
    }

    // ── Internal: enforce transition rules ──────────────────────────────────
    private void transition(Beneficiary b, BeneficiaryStatus target, String remarks) {
        BeneficiaryStatus current = b.getStatus();
        EnumSet<BeneficiaryStatus> allowed = ALLOWED_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(target)) {
            throw new IllegalStateException(
                "Invalid status transition: " + current + " → " + target);
        }
        BeneficiaryStatus previous = current;
        b.setStatus(target);
        historyRepo.save(new BeneficiaryHistory(b.getBeneficiaryId(), previous, target, remarks));
    }

    private WelfareEvent toEvent(String type, Beneficiary b, String schemeName, String remarks) {
        return new WelfareEvent(type, b.getBeneficiaryId(), b.getBeneficiaryCode(),
                b.getCitizenId(), b.getApplicantName(), b.getSchemeId(), schemeName,
                b.getStatus().name(), remarks, null);
    }
}
