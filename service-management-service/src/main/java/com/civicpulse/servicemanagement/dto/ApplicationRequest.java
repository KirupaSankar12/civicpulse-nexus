package com.civicpulse.servicemanagement.dto;

import com.civicpulse.servicemanagement.entity.ServiceType;
import jakarta.validation.constraints.*;
import java.util.Map;

public class ApplicationRequest {
    @NotBlank(message = "citizenId is required")
    private String citizenId;

    @NotNull(message = "serviceType is required")
    private ServiceType serviceType;

    @NotBlank(message = "applicantName is required")
    private String applicantName;

    @NotBlank(message = "aadhaarNumber is required")
    @Pattern(regexp = "^\\d{4}-\\d{4}-\\d{4}$", message = "Aadhaar must be in format XXXX-XXXX-XXXX")
    private String aadhaarNumber;

    private String documentsSubmitted;
    
    private Map<String, Object> dynamicData;

    public ApplicationRequest() {}

    public ApplicationRequest(String citizenId, ServiceType serviceType, String applicantName, String aadhaarNumber, String documentsSubmitted, Map<String, Object> dynamicData) {
        this.citizenId = citizenId;
        this.serviceType = serviceType;
        this.applicantName = applicantName;
        this.aadhaarNumber = aadhaarNumber;
        this.documentsSubmitted = documentsSubmitted;
        this.dynamicData = dynamicData;
    }

    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public String getDocumentsSubmitted() { return documentsSubmitted; }
    public void setDocumentsSubmitted(String documentsSubmitted) { this.documentsSubmitted = documentsSubmitted; }
    
    public Map<String, Object> getDynamicData() { return dynamicData; }
    public void setDynamicData(Map<String, Object> dynamicData) { this.dynamicData = dynamicData; }
}
