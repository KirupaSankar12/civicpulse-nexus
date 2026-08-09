package com.civicpulse.reporting_service.service;

import com.civicpulse.reporting_service.dto.DepartmentPerformance;
import com.civicpulse.reporting_service.dto.GovernanceSummary;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Transforms the live GovernanceSummary into a compact, PII-free JSON string
 * that is safe to send to the Gemini API.
 *
 * SECURITY RULES (strictly enforced here):
 *  - No citizen names, Aadhaar numbers, phone numbers, or addresses.
 *  - No JWT tokens, passwords, or authentication data.
 *  - No bank account numbers or individual financial records.
 *  - Only aggregated counts, rates, and percentages.
 */
@Component
public class GovernanceDataBuilder {

    /**
     * Produces a compact JSON string of aggregated governance statistics
     * ready to embed in a Gemini prompt.
     */
    public String buildSafeStatsJson(GovernanceSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"reportDate\": \"").append(LocalDateTime.now().toLocalDate()).append("\",\n");
        sb.append("  \"reportTime\": \"").append(LocalDateTime.now().toLocalTime().withNano(0)).append("\",\n");

        // Citizen count (aggregate only — no names/IDs)
        sb.append("  \"totalCitizens\": ").append(summary.getTotalCitizens()).append(",\n");
        sb.append("  \"totalRequests\": ").append(summary.getTotalRequests()).append(",\n");

        // Resolution & performance
        sb.append("  \"overallResolutionRate\": ").append(round2(summary.getOverallResolutionRate())).append(",\n");
        sb.append("  \"overdueOrEscalatedCount\": ").append(summary.getOverdueOrEscalatedCount()).append(",\n");

        // Revenue (aggregate total — no individual transactions)
        sb.append("  \"totalRevenueINR\": ").append(
            summary.getTotalRevenue() != null ? summary.getTotalRevenue().toPlainString() : "0"
        ).append(",\n");

        // Welfare (aggregate statistics — no beneficiary names/IDs)
        sb.append("  \"budgetUtilizationPercent\": ").append(round2(summary.getBudgetUtilizationPercent())).append(",\n");

        // Satisfaction (average score — no individual responses)
        sb.append("  \"citizenSatisfactionScore\": ").append(round2(summary.getCitizenSatisfactionScore())).append(",\n");
        sb.append("  \"satisfactionDataAvailable\": ").append(summary.getCitizenSatisfactionScore() > 0).append(",\n");

        // Data availability flags
        sb.append("  \"dataAvailability\": {\n");
        sb.append("    \"grievance\": ").append(!summary.isGrievanceDataUnavailable()).append(",\n");
        sb.append("    \"certificate\": ").append(!summary.isCertificateDataUnavailable()).append(",\n");
        sb.append("    \"welfare\": ").append(!summary.isWelfareDataUnavailable()).append(",\n");
        sb.append("    \"citizen\": ").append(!summary.isCitizenDataUnavailable()).append("\n");
        sb.append("  },\n");

        // Department performance (names + aggregated metrics only)
        sb.append("  \"departments\": [\n");
        Map<String, DepartmentPerformance> depts = summary.getDepartmentPerformance();
        if (depts != null && !depts.isEmpty()) {
            List<Map.Entry<String, DepartmentPerformance>> entries = new ArrayList<>(depts.entrySet());
            for (int i = 0; i < entries.size(); i++) {
                DepartmentPerformance d = entries.get(i).getValue();
                sb.append("    {\n");
                sb.append("      \"name\": \"").append(sanitise(d.getDepartment())).append("\",\n");
                sb.append("      \"totalHandled\": ").append(d.getTotalHandled()).append(",\n");
                sb.append("      \"resolutionRate\": ").append(round2(d.getResolutionRate())).append(",\n");
                sb.append("      \"avgTurnaroundHours\": ").append(round2(d.getAvgTurnaroundHours())).append("\n");
                sb.append("    }");
                if (i < entries.size() - 1) sb.append(",");
                sb.append("\n");
            }
        }
        sb.append("  ]\n");
        sb.append("}");
        return sb.toString();
    }

    /** Remove any characters that could cause prompt injection. */
    private String sanitise(String input) {
        if (input == null) return "Unknown";
        return input.replaceAll("[\"\\\\<>]", "").trim();
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
