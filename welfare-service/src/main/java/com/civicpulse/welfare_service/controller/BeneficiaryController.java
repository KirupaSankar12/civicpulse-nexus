package com.civicpulse.welfare_service.controller;

import com.civicpulse.welfare_service.entity.Beneficiary;
import com.civicpulse.welfare_service.entity.BeneficiaryHistory;
import com.civicpulse.welfare_service.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/welfare")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    // POST /api/welfare/schemes/{schemeId}/apply
    @PostMapping("/schemes/{schemeId}/apply")
    public ResponseEntity<Beneficiary> apply(@PathVariable UUID schemeId,
                                              @Valid @RequestBody Beneficiary beneficiary) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                beneficiaryService.apply(schemeId, beneficiary));
    }

    // GET /api/welfare/beneficiaries/citizen/{citizenId}
    @GetMapping("/beneficiaries/citizen/{citizenId}")
    public ResponseEntity<List<Beneficiary>> getByCitizen(@PathVariable String citizenId) {
        return ResponseEntity.ok(beneficiaryService.getByCitizenId(citizenId));
    }

    // GET /api/welfare/beneficiaries/pending
    @GetMapping("/beneficiaries/pending")
    public ResponseEntity<List<Beneficiary>> getPending() {
        return ResponseEntity.ok(beneficiaryService.getPending());
    }

    // PUT /api/welfare/beneficiaries/{id}/review
    @PutMapping("/beneficiaries/{id}/review")
    public ResponseEntity<Beneficiary> review(@PathVariable UUID id,
                                               @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(beneficiaryService.moveToUnderReview(id, remarks));
    }

    // PUT /api/welfare/beneficiaries/{id}/approve
    @PutMapping("/beneficiaries/{id}/approve")
    public ResponseEntity<Beneficiary> approve(@PathVariable UUID id,
                                                @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(beneficiaryService.approve(id, remarks));
    }

    // PUT /api/welfare/beneficiaries/{id}/reject
    @PutMapping("/beneficiaries/{id}/reject")
    public ResponseEntity<Beneficiary> reject(@PathVariable UUID id,
                                               @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(beneficiaryService.reject(id, reason));
    }

    // GET /api/welfare/beneficiaries/{id}/history
    @GetMapping("/beneficiaries/{id}/history")
    public ResponseEntity<List<BeneficiaryHistory>> getHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(beneficiaryService.getHistory(id));
    }
}
