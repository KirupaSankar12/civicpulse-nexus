package com.civicpulse.notification_service.consumer;

import com.civicpulse.notification_service.dto.ApplicationEvent;
import com.civicpulse.notification_service.dto.ComplaintEvent;
import com.civicpulse.notification_service.dto.WelfareEvent;
import com.civicpulse.notification_service.entity.Notification;
import com.civicpulse.notification_service.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class KafkaConsumerService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public KafkaConsumerService(NotificationRepository notificationRepository, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    // ────────────────────────────────────────────────────────────────────────
    // CERTIFICATE EVENTS
    // ────────────────────────────────────────────────────────────────────────

    @KafkaListener(topics = "certificate-submitted", groupId = "notification-group")
    public void consumeCertificateSubmitted(String message) {
        try {
            ApplicationEvent event = objectMapper.readValue(message, ApplicationEvent.class);
            // Notify all officers in the department
            notifyDepartmentOfficers(event.getDepartment(), 
                    "New Certificate Assigned", 
                    "Application " + event.getApplicationNumber() + " requires verification.", 
                    event.getApplicationId(), 
                    "CERTIFICATE",
                    "certificate-submitted");
        } catch (Exception e) {
            System.err.println("Failed to process certificate-submitted: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "application-under-verification", groupId = "notification-group")
    public void consumeApplicationUnderVerification(String message) {
        try {
            ApplicationEvent event = objectMapper.readValue(message, ApplicationEvent.class);
            saveNotification(event.getCitizenId(), "Application Under Verification",
                    "Your certificate application " + event.getApplicationNumber() + " is currently under verification.",
                    event.getApplicationId(), "CERTIFICATE", "application-under-verification", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process application-under-verification: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "additional-information-requested", groupId = "notification-group")
    public void consumeAdditionalInfoRequested(String message) {
        try {
            ApplicationEvent event = objectMapper.readValue(message, ApplicationEvent.class);
            saveNotification(event.getCitizenId(), "Action Required",
                    "Please upload additional documents for application " + event.getApplicationNumber() + ". Remarks: " + event.getRemarks(),
                    event.getApplicationId(), "CERTIFICATE", "additional-information-requested", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process additional-information-requested: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "certificate-approved", groupId = "notification-group")
    public void consumeCertificateApproved(String message) {
        try {
            ApplicationEvent event = objectMapper.readValue(message, ApplicationEvent.class);
            saveNotification(event.getCitizenId(), "Certificate Approved",
                    "Your certificate application " + event.getApplicationNumber() + " has been approved.",
                    event.getApplicationId(), "CERTIFICATE", "certificate-approved", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process certificate-approved: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "certificate-generated", groupId = "notification-group")
    public void consumeCertificateGenerated(String message) {
        try {
            ApplicationEvent event = objectMapper.readValue(message, ApplicationEvent.class);
            saveNotification(event.getCitizenId(), "Certificate Generated",
                    "Your certificate is ready for download (App No: " + event.getApplicationNumber() + ").",
                    event.getApplicationId(), "CERTIFICATE", "certificate-generated", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process certificate-generated: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "certificate-rejected", groupId = "notification-group")
    public void consumeCertificateRejected(String message) {
        try {
            ApplicationEvent event = objectMapper.readValue(message, ApplicationEvent.class);
            saveNotification(event.getCitizenId(), "Application Rejected",
                    "Your application " + event.getApplicationNumber() + " was rejected. Reason: " + event.getRemarks(),
                    event.getApplicationId(), "CERTIFICATE", "certificate-rejected", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process certificate-rejected: " + e.getMessage());
        }
    }
    
    @KafkaListener(topics = "application-resubmitted", groupId = "notification-group")
    public void consumeApplicationResubmitted(String message) {
        try {
            ApplicationEvent event = objectMapper.readValue(message, ApplicationEvent.class);
            notifyDepartmentOfficers(event.getDepartment(), 
                    "Application Resubmitted", 
                    "Application " + event.getApplicationNumber() + " was resubmitted with new documents.", 
                    event.getApplicationId(), 
                    "CERTIFICATE",
                    "application-resubmitted");
                    
            saveNotification(event.getCitizenId(), "Application Resubmitted",
                    "Documents uploaded successfully. Your application " + event.getApplicationNumber() + " has been resubmitted for verification.",
                    event.getApplicationId(), "CERTIFICATE", "application-resubmitted", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process application-resubmitted: " + e.getMessage());
        }
    }


    // ────────────────────────────────────────────────────────────────────────
    // COMPLAINT EVENTS
    // ────────────────────────────────────────────────────────────────────────

    @KafkaListener(topics = "complaint-submitted", groupId = "notification-group")
    public void consumeComplaintSubmitted(String message) {
        try {
            ComplaintEvent event = objectMapper.readValue(message, ComplaintEvent.class);
            
            System.out.println("DEBUG: Event Consumed from complaint-submitted. Complaint ID=" + event.getComplaintId());
            
            String formattedMessage = "Your complaint has been submitted successfully.\n\n" +
                                      "Complaint ID: " + event.getComplaintId() + "\n" +
                                      "Department: " + (event.getDepartment() != null ? event.getDepartment() : "N/A") + "\n" +
                                      "Status: Submitted";
                                      
            // Notify Citizen
            saveNotification(event.getCitizenId(), "Complaint Submitted Successfully",
                    formattedMessage,
                    event.getComplaintId(), "COMPLAINT", "complaint-submitted", "CITIZEN");
                    
            System.out.println("DEBUG: Notification Saved to Database & Sent to User: " + event.getCitizenId());
        } catch (Exception e) {
            System.err.println("Failed to process complaint-submitted: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "complaint-assigned", groupId = "notification-group")
    public void consumeComplaintAssigned(String message) {
        try {
            ComplaintEvent event = objectMapper.readValue(message, ComplaintEvent.class);
            
            // Notify Officer
            if (event.getAssignedOfficer() != null) {
                saveNotification(event.getAssignedOfficer(), "New Complaint Assigned",
                        "A new complaint has been assigned to you. Please investigate.",
                        event.getComplaintId(), "COMPLAINT", "complaint-assigned-officer", "OFFICER");
            }
            
            // Notify Citizen
            saveNotification(event.getCitizenId(), "Complaint Assigned",
                    "Your complaint has been assigned to an officer and will be investigated shortly.",
                    event.getComplaintId(), "COMPLAINT", "complaint-assigned", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process complaint-assigned: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "complaint-in-progress", groupId = "notification-group")
    public void consumeComplaintInProgress(String message) {
        try {
            ComplaintEvent event = objectMapper.readValue(message, ComplaintEvent.class);
            saveNotification(event.getCitizenId(), "Complaint In Progress",
                    "Work has started on your complaint. We will notify you once it's resolved.",
                    event.getComplaintId(), "COMPLAINT", "complaint-in-progress", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process complaint-in-progress: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "complaint-resolved", groupId = "notification-group")
    public void consumeComplaintResolved(String message) {
        try {
            ComplaintEvent event = objectMapper.readValue(message, ComplaintEvent.class);
            saveNotification(event.getCitizenId(), "Complaint Resolved",
                    "Your complaint has been successfully resolved. " + (event.getRemarks() != null ? "Remarks: " + event.getRemarks() : ""),
                    event.getComplaintId(), "COMPLAINT", "complaint-resolved", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process complaint-resolved: " + e.getMessage());
        }
    }


    // ────────────────────────────────────────────────────────────────────────
    // WELFARE EVENTS (Milestone 3)
    // ────────────────────────────────────────────────────────────────────────

    @KafkaListener(topics = "beneficiary-applied", groupId = "notification-group")
    public void consumeBeneficiaryApplied(String message) {
        try {
            WelfareEvent event = objectMapper.readValue(message, WelfareEvent.class);
            String title = "Welfare Application Submitted";
            String text = "Your application for " + (event.getSchemeName() != null ? event.getSchemeName() : "Welfare Scheme") + 
                          " (Code: " + event.getBeneficiaryCode() + ") has been submitted successfully and is pending officer verification.";
            
            saveNotification(event.getCitizenId(), title, text, 
                    event.getBeneficiaryId(), "WELFARE", "beneficiary-applied", "CITIZEN");

            // Notify assigned officer/department
            if (event.getDepartment() != null) {
                notifyDepartmentOfficers(event.getDepartment(), "New Welfare Application Received", 
                    "A new welfare application (Code: " + event.getBeneficiaryCode() + ") for " + 
                    (event.getSchemeName() != null ? event.getSchemeName() : "Welfare Scheme") + " has been assigned to your department.", 
                    event.getBeneficiaryId(), "WELFARE", "beneficiary-applied");
            }

        } catch (Exception e) {
            System.err.println("Failed to process beneficiary-applied: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "beneficiary-verified", groupId = "notification-group")
    public void consumeBeneficiaryVerified(String message) {
        try {
            WelfareEvent event = objectMapper.readValue(message, WelfareEvent.class);
            String title = "Welfare Application Verified";
            String text = "Your application for " + (event.getSchemeName() != null ? event.getSchemeName() : "Welfare Scheme") + 
                          " (Code: " + event.getBeneficiaryCode() + ") has been verified by the department officer and forwarded for final sanction.";
            
            saveNotification(event.getCitizenId(), title, text, 
                    event.getBeneficiaryId(), "WELFARE", "beneficiary-verified", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process beneficiary-verified: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "beneficiary-approved", groupId = "notification-group")
    public void consumeBeneficiaryApproved(String message) {
        try {
            WelfareEvent event = objectMapper.readValue(message, WelfareEvent.class);
            String title = "Welfare Application Approved";
            String text = "Congratulations! Your welfare application for " + (event.getSchemeName() != null ? event.getSchemeName() : "Welfare Scheme") + 
                          " (Code: " + event.getBeneficiaryCode() + ") has received final sanction for fund disbursement.";
            
            saveNotification(event.getCitizenId(), title, text, 
                    event.getBeneficiaryId(), "WELFARE", "beneficiary-approved", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process beneficiary-approved: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "beneficiary-rejected", groupId = "notification-group")
    public void consumeBeneficiaryRejected(String message) {
        try {
            WelfareEvent event = objectMapper.readValue(message, WelfareEvent.class);
            String title = "Welfare Application Update";
            String text = "Your application for " + (event.getSchemeName() != null ? event.getSchemeName() : "Welfare Scheme") + 
                          " (Code: " + event.getBeneficiaryCode() + ") was rejected. Reason: " + (event.getRemarks() != null ? event.getRemarks() : "Criteria not met");
            
            saveNotification(event.getCitizenId(), title, text, 
                    event.getBeneficiaryId(), "WELFARE", "beneficiary-rejected", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process beneficiary-rejected: " + e.getMessage());
        }
    }

    @KafkaListener(topics = {"funds-disbursed", "fund-disbursed"}, groupId = "notification-group")
    public void consumeFundsDisbursed(String message) {
        try {
            WelfareEvent event = objectMapper.readValue(message, WelfareEvent.class);
            String title = "Direct Benefit Transfer (DBT) Disbursed";
            String text = "Welfare benefit funds for " + (event.getSchemeName() != null ? event.getSchemeName() : "Welfare Scheme") + 
                          " (Code: " + event.getBeneficiaryCode() + ") have been successfully transferred to your bank account." + 
                          (event.getTransactionId() != null ? " TXN ID: " + event.getTransactionId() : "");
            
            saveNotification(event.getCitizenId(), title, text, 
                    event.getBeneficiaryId(), "WELFARE", "funds-disbursed", "CITIZEN");
        } catch (Exception e) {
            System.err.println("Failed to process funds-disbursed: " + e.getMessage());
        }
    }


    // ────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ────────────────────────────────────────────────────────────────────────

    private void saveNotification(String recipient, String title, String message, String relatedEntityId, String relatedEntityType, String eventType, String recipientRole) {
        if (recipient == null || recipient.isBlank()) return;
        Notification notification = new Notification(
                recipient,
                eventType,
                title,
                message,
                relatedEntityId,
                relatedEntityType,
                false,
                recipientRole,
                LocalDateTime.now()
        );
        notificationRepository.save(notification);
        System.out.println("Saved notification to DB for recipient: " + recipient + " [" + title + "]");
    }

    private void notifyDepartmentOfficers(String department, String title, String message, String relatedEntityId, String relatedEntityType, String eventType) {
        if (department == null || department.isBlank()) return;
        
        String username = null;
        if ("Education Department".equalsIgnoreCase(department)) {
            username = "emily";
        } else if ("Social Welfare Department".equalsIgnoreCase(department)) {
            username = "david";
        } else if ("Health Department".equalsIgnoreCase(department)) {
            username = "john";
        }

        if (username != null) {
            saveNotification(username, title, message, relatedEntityId, relatedEntityType, eventType, "OFFICER");
        } else {
            // Fallback: Just notify the department "group"
            saveNotification("department:" + department, title, message, relatedEntityId, relatedEntityType, eventType, "OFFICER");
        }
    }
}
