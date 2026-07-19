package com.civicpulse.servicemanagement.service;

import com.civicpulse.servicemanagement.entity.ServiceApplication;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class CertificateService {
    private static final Logger log = LoggerFactory.getLogger(CertificateService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    /**
     * Generates a PDF certificate as byte array.
     * Includes simulated digital signature watermark.
     */
    public byte[] generateCertificatePdf(ServiceApplication app) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            
            // ── Header ────────────────────────────────────────────────
            Paragraph header = new Paragraph("GOVERNMENT OF INDIA")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(0, 51, 102));
            doc.add(header);
            
            doc.add(new Paragraph("CivicPulse Nexus — Municipal Services")
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.DARK_GRAY));
            
            doc.add(new Paragraph("─────────────────────────────────────────────")
                .setTextAlignment(TextAlignment.CENTER));
            
            // ── Certificate Type ──────────────────────────────────────
            doc.add(new Paragraph(app.getServiceType().name().replace("_", " ").toUpperCase())
                .setFontSize(22)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(180, 20, 20))
                .setMarginTop(10));
            
            doc.add(new Paragraph("Certificate Number: " + app.getCertificateNumber())
                .setFontSize(11)
                .setTextAlignment(TextAlignment.CENTER)
                .setBold());
            
            doc.add(new Paragraph(" "));
            
            // ── Certificate Body ──────────────────────────────────────
            doc.add(new Paragraph(
                "This is to certify that the following individual has been verified and " +
                "approved for the issuance of " + app.getServiceType().name().replace("_", " ").toLowerCase() +
                " by the Municipal Authority under CivicPulse Nexus Governance Platform.")
                .setFontSize(11)
                .setTextAlignment(TextAlignment.JUSTIFIED));
            
            doc.add(new Paragraph(" "));
            
            // ── Details Table ─────────────────────────────────────────
            Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .useAllAvailableWidth();
            addRow(table, "Applicant Name",    app.getApplicantName());
            addRow(table, "Aadhaar Number",    maskAadhaar(app.getAadhaarNumber()));
            addRow(table, "Certificate Type",  app.getServiceType().name().replace("_", " "));
            addRow(table, "Certificate No.",   app.getCertificateNumber());
            addRow(table, "Application No.",   app.getApplicationNumber());
            addRow(table, "Applied Date",
                app.getAppliedDate() != null ? app.getAppliedDate().format(FMT) : "N/A");
            addRow(table, "Approved Date",
                app.getApprovedDate() != null ? app.getApprovedDate().format(FMT) : "N/A");
            addRow(table, "Approved By",
                app.getApprovedBy() != null ? app.getApprovedBy() : "Municipal Officer");
            addRow(table, "Status",            app.getStatus().name());
            doc.add(table);
            
            doc.add(new Paragraph(" "));
            
            // ── Digital Signature ─────────────────────────────────────
            doc.add(new Paragraph("─────────────────────────────────────────────")
                .setTextAlignment(TextAlignment.CENTER));
            
            doc.add(new Paragraph("DIGITAL SIGNATURE")
                .setFontSize(13)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(0, 100, 0)));
            
            String sigText = app.getDigitalSignature() != null
                ? app.getDigitalSignature()
                : "Digitally Signed by Municipal Officer | Cert No: " + app.getCertificateNumber();
            
            doc.add(new Paragraph(sigText)
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setItalic()
                .setFontColor(ColorConstants.DARK_GRAY));
            
            doc.add(new Paragraph(" "));
            
            doc.add(new Paragraph(
                "This certificate is digitally generated and does not require a physical signature. " +
                "Verify authenticity at: civicpulse.gov.in/verify/" + app.getCertificateNumber())
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY));
            
            doc.close();
            log.info("PDF generated for certificate: {}", app.getCertificateNumber());
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Certificate PDF generation failed", e);
        }
    }

    private void addRow(Table table, String label, String value) {
        table.addCell(new Cell()
            .add(new Paragraph(label).setBold().setFontSize(10))
            .setBackgroundColor(new DeviceRgb(240, 248, 255)));
        table.addCell(new Cell()
            .add(new Paragraph(value != null ? value : "—").setFontSize(10)));
    }

    private String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() < 4) return "****";
        return "XXXX-XXXX-" + aadhaar.substring(aadhaar.length() - 4);
    }
}
