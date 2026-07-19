package com.civicpulse.servicemanagement.config;

import com.civicpulse.servicemanagement.entity.DepartmentOfficer;
import com.civicpulse.servicemanagement.repository.DepartmentOfficerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

import com.civicpulse.servicemanagement.entity.ServiceApplication;
import com.civicpulse.servicemanagement.repository.ApplicationRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final DepartmentOfficerRepository departmentOfficerRepository;
    private final ApplicationRepository applicationRepository;

    public DataInitializer(DepartmentOfficerRepository departmentOfficerRepository, ApplicationRepository applicationRepository) {
        this.departmentOfficerRepository = departmentOfficerRepository;
        this.applicationRepository = applicationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking and initializing default officers...");

        List<DepartmentOfficer> defaultOfficers = Arrays.asList(
            new DepartmentOfficer("john", "John Officer", "Health", "OFFICER"),
            new DepartmentOfficer("mark", "Mark Officer", "Revenue", "OFFICER"),
            new DepartmentOfficer("ryan", "Ryan Officer", "Municipal Corporation", "OFFICER"),
            new DepartmentOfficer("chris", "Chris Officer", "Water", "OFFICER"),
            new DepartmentOfficer("ethan", "Ethan Officer", "Roads", "OFFICER"),
            new DepartmentOfficer("jack", "Jack Officer", "Electricity", "OFFICER"),
            new DepartmentOfficer("david", "David Officer", "Sanitation", "OFFICER")
        );

        for (DepartmentOfficer officer : defaultOfficers) {
            departmentOfficerRepository.findByUsername(officer.getUsername()).ifPresentOrElse(
                existingOfficer -> {
                    existingOfficer.setOfficerName(officer.getOfficerName());
                    existingOfficer.setDepartment(officer.getDepartment());
                    existingOfficer.setRole(officer.getRole());
                    departmentOfficerRepository.save(existingOfficer);
                    log.info("Updated existing officer: {}", officer.getUsername());
                },
                () -> {
                    departmentOfficerRepository.save(officer);
                    log.info("Created default officer: {} for department: {}", officer.getUsername(), officer.getDepartment());
                }
            );
        }

        // Migrate old application departments to match the new strict names
        log.info("Migrating legacy department names in ServiceApplications...");
        List<ServiceApplication> apps = applicationRepository.findAll();
        for (ServiceApplication app : apps) {
            if (app.getDepartment() != null && app.getDepartment().endsWith(" Department")) {
                String oldDept = app.getDepartment();
                String newDept = oldDept.replace(" Department", "");
                app.setDepartment(newDept);
                applicationRepository.save(app);
                log.info("Migrated application {} department from '{}' to '{}'", app.getApplicationNumber(), oldDept, newDept);
            }
        }
    }
}
