package com.civicpulse.citizen_service.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.civicpulse.citizen_service.dto.PublicRegisterDTO;
import com.civicpulse.citizen_service.entity.Citizen;
import com.civicpulse.citizen_service.repository.CitizenRepository;
import com.civicpulse.citizen_service.service.KeycloakAdminService;

import jakarta.validation.Valid;

/**
 * Public registration controller — no JWT required.
 * Creates both a Keycloak user account and a citizen profile in one step.
 */
@RestController
@RequestMapping("/api/citizens/auth")
public class PublicRegistrationController {

    private final CitizenRepository citizenRepository;
    private final KeycloakAdminService keycloakAdminService;

    public PublicRegistrationController(CitizenRepository citizenRepository,
                                         KeycloakAdminService keycloakAdminService) {
        this.citizenRepository = citizenRepository;
        this.keycloakAdminService = keycloakAdminService;
    }

    /**
     * POST /api/citizens/auth/register
     * Public endpoint — called from the React registration form.
     * 1. Validates that email is not already registered
     * 2. Creates Keycloak user with CITIZEN role
     * 3. Saves citizen profile in PostgreSQL (citizenId = Keycloak subject UUID)
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerCitizen(@Valid @RequestBody PublicRegisterDTO dto) {
        // Check if email already exists in our DB
        if (citizenRepository.existsByEmail(dto.email)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "An account with this email already exists. Please login."));
        }

        // Check if email already exists in Keycloak
        if (keycloakAdminService.userExists(dto.email)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "This email is already registered in the system. Please login."));
        }

        try {
            // Step 1: Create Keycloak user and get the Keycloak user UUID
            String keycloakUserId = keycloakAdminService.createKeycloakUser(
                dto.email, dto.name, dto.password
            );

            // Step 2: Assign CITIZEN role in Keycloak
            keycloakAdminService.assignRealmRole(keycloakUserId, "CITIZEN");

            // Step 3: Save citizen profile in DB using Keycloak UUID as citizenId
            Citizen citizen = new Citizen();
            citizen.citizenId = java.util.UUID.fromString(keycloakUserId);
            citizen.name = dto.name;
            citizen.email = dto.email;
            citizen.phoneNumber = dto.phoneNumber;
            citizen.aadhar = (dto.aadhar == null || dto.aadhar.isBlank()) ? null : dto.aadhar;
            citizen.address = dto.address;
            citizen.ward = dto.ward;
            citizen.city = dto.city;
            citizen.state = (dto.state == null || dto.state.isBlank()) ? "India" : dto.state;
            citizen.pincode = dto.pincode;

            citizenRepository.save(citizen);

            return ResponseEntity.ok(Map.of(
                "message", "Registration successful! You can now login with your email and password.",
                "citizenId", keycloakUserId
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }
}
