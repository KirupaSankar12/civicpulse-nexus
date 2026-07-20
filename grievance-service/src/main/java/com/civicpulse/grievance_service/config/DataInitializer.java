package com.civicpulse.grievance_service.config;

import com.civicpulse.grievance_service.entity.Officer;
import com.civicpulse.grievance_service.repository.OfficerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final OfficerRepository officerRepository;

    public DataInitializer(OfficerRepository officerRepository) {
        this.officerRepository = officerRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking and initializing default grievance officers...");

        List<Officer> defaultOfficers = Arrays.asList(
            createOfficer("john", "Health"),
            createOfficer("mark", "Revenue"),
            createOfficer("ryan", "Municipal Corporation"),
            createOfficer("chris", "Water"),
            createOfficer("ethan", "Roads"),
            createOfficer("jack", "Electricity"),
            createOfficer("david", "Sanitation")
        );

        for (Officer officer : defaultOfficers) {
            officerRepository.findByNameIgnoreCase(officer.getName()).ifPresentOrElse(
                existingOfficer -> {
                    existingOfficer.setDepartment(officer.getDepartment());
                    officerRepository.save(existingOfficer);
                    log.info("Updated existing officer: {}", officer.getName());
                },
                () -> {
                    officerRepository.save(officer);
                    log.info("Created default officer: {} for department: {}", officer.getName(), officer.getDepartment());
                }
            );
        }
    }

    private Officer createOfficer(String name, String department) {
        Officer officer = new Officer();
        officer.setName(name);
        officer.setDepartment(department);
        return officer;
    }
}
