package com.civicpulse.reporting_service.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Structured response returned by the AI Governance Intelligence endpoints.
 * Mirrors the JSON shape requested from Gemini so it can be serialised directly.
 */
public class AiGovernanceResponse {

    /** HIGH_PERFORMANCE | GOOD | NEEDS_ATTENTION | CRITICAL */
    private String overallStatus;

    /** One-paragraph executive summary of current governance health. */
    private String summary;

    /** 3-5 key analytical observations drawn from the live data. */
    private List<String> insights;

    /** Items that require immediate attention (empty list when all is well). */
    private List<String> warnings;

    /** Concrete, actionable recommendations for the admin. */
    private List<String> recommendations;

    /** UTC timestamp of when this analysis was generated. */
    private String dataTimestamp;

    /** True when Gemini was unavailable — caller should show graceful fallback. */
    private boolean aiUnavailable;

    /** Optional error message shown to the user when aiUnavailable=true. */
    private String errorMessage;

    public AiGovernanceResponse() {}

    // ── Static factory helpers ────────────────────────────────────────────────

    public static AiGovernanceResponse unavailable(String reason) {
        AiGovernanceResponse r = new AiGovernanceResponse();
        r.aiUnavailable = true;
        r.errorMessage  = reason;
        r.overallStatus = "UNAVAILABLE";
        r.summary       = "AI insights are temporarily unavailable. Dashboard data remains available.";
        r.insights      = List.of();
        r.warnings      = List.of();
        r.recommendations = List.of();
        r.dataTimestamp = LocalDateTime.now().toString();
        return r;
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getOverallStatus()         { return overallStatus; }
    public void setOverallStatus(String s)   { this.overallStatus = s; }

    public String getSummary()               { return summary; }
    public void setSummary(String s)         { this.summary = s; }

    public List<String> getInsights()        { return insights; }
    public void setInsights(List<String> l)  { this.insights = l; }

    public List<String> getWarnings()        { return warnings; }
    public void setWarnings(List<String> l)  { this.warnings = l; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> l) { this.recommendations = l; }

    public String getDataTimestamp()         { return dataTimestamp; }
    public void setDataTimestamp(String s)   { this.dataTimestamp = s; }

    public boolean isAiUnavailable()         { return aiUnavailable; }
    public void setAiUnavailable(boolean b)  { this.aiUnavailable = b; }

    public String getErrorMessage()          { return errorMessage; }
    public void setErrorMessage(String s)    { this.errorMessage = s; }
}
