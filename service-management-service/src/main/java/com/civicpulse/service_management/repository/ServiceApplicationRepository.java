package com.civicpulse.service_management.repository;

import com.civicpulse.service_management.entity.ServiceApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ServiceApplicationRepository extends JpaRepository<ServiceApplication, UUID> {
    List<ServiceApplication> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId);
    List<ServiceApplication> findByStatusOrderByCreatedAtDesc(String status);
    List<ServiceApplication> findByAssignedOfficerAndStatusOrderByCreatedAtDesc(String assignedOfficer, String status);
}
