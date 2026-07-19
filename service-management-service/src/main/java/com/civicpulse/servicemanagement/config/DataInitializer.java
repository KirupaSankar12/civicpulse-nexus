package com.civicpulse.servicemanagement.config;

import com.civicpulse.servicemanagement.entity.DepartmentOfficer;
import com.civicpulse.servicemanagement.repository.DepartmentOfficerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final DepartmentOfficerRepository departmentOfficerRepository;

    public DataInitializer(DepartmentOfficerRepository departmentOfficerRepository) {
        this.departmentOfficerRepository = departmentOfficerRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking and initializing default officers...");

        List<DepartmentOfficer> defaultOfficers = Arrays.asList(
            new DepartmentOfficer("health_officer", "Dr. Anitha Devi", "Health Department", "OFFICER"),
            new DepartmentOfficer("revenue_officer", "Ravi Kumar", "Revenue Department", "OFFICER"),
            new DepartmentOfficer("municipal_officer", "Karthik Raj", "Municipal Corporation", "OFFICER"),
            new DepartmentOfficer("sibi", "Sibi Officer", "Water", "OFFICER"),
            new DepartmentOfficer("joyel", "Joyel Officer", "Public Works", "OFFICER"),
            new DepartmentOfficer("kirupa", "Kirupa Officer", "Sanitation Dept", "OFFICER"),
            new DepartmentOfficer("harish", "Harish Officer", "Water", "OFFICER"),
            new DepartmentOfficer("karthick", "Karthick", "Health Department", "OFFICER"),
            new DepartmentOfficer("joseph", "Joseph", "Revenue Department", "OFFICER"),
            new DepartmentOfficer("vikram", "Vikram", "Municipal Corporation", "OFFICER")
        );

        for (DepartmentOfficer officer : defaultOfficers) {
            if (departmentOfficerRepository.findByUsername(officer.getUsername()).isEmpty()) {
                departmentOfficerRepository.save(officer);
                log.info("Created default officer: {} for department: {}", officer.getUsername(), officer.getDepartment());
            } else {
                log.info("Officer {} already exists. Skipping.", officer.getUsername());
            }
        }
    }
}
