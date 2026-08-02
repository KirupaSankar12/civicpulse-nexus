package com.civicpulse.reporting_service.dto;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Master governance analytics dashboard response.
 * Aggregated from all downstream microservices.
 */
public class GovernanceSummary {

    private long totalCitizens;
    private long totalRequests;            // complaints + cert apps + welfare apps
    private double overallResolutionRate;  // % resolved across all types
    private BigDecimal totalRevenue;
    private double budgetUtilizationPercent;
    private double citizenSatisfactionScore;
    private double complaintTrendPercent;  // % change vs prior period (negative = fewer = good)
    private Map<String, DepartmentPerformance> departmentPerformance;
    private long overdueOrEscalatedCount;

    // Partial-data flags — true if that service was unreachable
    private boolean citizenDataUnavailable;
    private boolean grievanceDataUnavailable;
    private boolean certificateDataUnavailable;
    private boolean welfareDataUnavailable;

    public GovernanceSummary() {}

    // Getters
    public long getTotalCitizens() { return totalCitizens; }
    public long getTotalRequests() { return totalRequests; }
    public double getOverallResolutionRate() { return overallResolutionRate; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public double getBudgetUtilizationPercent() { return budgetUtilizationPercent; }
    public double getCitizenSatisfactionScore() { return citizenSatisfactionScore; }
    public double getComplaintTrendPercent() { return complaintTrendPercent; }
    public Map<String, DepartmentPerformance> getDepartmentPerformance() { return departmentPerformance; }
    public long getOverdueOrEscalatedCount() { return overdueOrEscalatedCount; }
    public boolean isCitizenDataUnavailable() { return citizenDataUnavailable; }
    public boolean isGrievanceDataUnavailable() { return grievanceDataUnavailable; }
    public boolean isCertificateDataUnavailable() { return certificateDataUnavailable; }
    public boolean isWelfareDataUnavailable() { return welfareDataUnavailable; }

    // Setters
    public void setTotalCitizens(long totalCitizens) { this.totalCitizens = totalCitizens; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
    public void setOverallResolutionRate(double overallResolutionRate) { this.overallResolutionRate = overallResolutionRate; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public void setBudgetUtilizationPercent(double budgetUtilizationPercent) { this.budgetUtilizationPercent = budgetUtilizationPercent; }
    public void setCitizenSatisfactionScore(double citizenSatisfactionScore) { this.citizenSatisfactionScore = citizenSatisfactionScore; }
    public void setComplaintTrendPercent(double complaintTrendPercent) { this.complaintTrendPercent = complaintTrendPercent; }
    public void setDepartmentPerformance(Map<String, DepartmentPerformance> departmentPerformance) { this.departmentPerformance = departmentPerformance; }
    public void setOverdueOrEscalatedCount(long overdueOrEscalatedCount) { this.overdueOrEscalatedCount = overdueOrEscalatedCount; }
    public void setCitizenDataUnavailable(boolean citizenDataUnavailable) { this.citizenDataUnavailable = citizenDataUnavailable; }
    public void setGrievanceDataUnavailable(boolean grievanceDataUnavailable) { this.grievanceDataUnavailable = grievanceDataUnavailable; }
    public void setCertificateDataUnavailable(boolean certificateDataUnavailable) { this.certificateDataUnavailable = certificateDataUnavailable; }
    public void setWelfareDataUnavailable(boolean welfareDataUnavailable) { this.welfareDataUnavailable = welfareDataUnavailable; }
}
