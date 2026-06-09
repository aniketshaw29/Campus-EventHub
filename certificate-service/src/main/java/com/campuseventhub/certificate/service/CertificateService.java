package com.campuseventhub.certificate.service;

import com.campuseventhub.certificate.dto.CertificateResponse;
import com.campuseventhub.certificate.entity.Certificate;
import com.campuseventhub.certificate.exception.CertificateNotFoundException;
import com.campuseventhub.certificate.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    @Transactional
    public CertificateResponse generateCertificate(Long registrationId, String studentId,
                                                    String studentName, Long eventId,
                                                    String eventTitle) {
        return certificateRepository.findByRegistrationId(registrationId)
                .map(this::toResponse)
                .orElseGet(() -> {
                    String certNumber = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    byte[] pdf = buildPdf(studentName, eventTitle, certNumber);

                    Certificate certificate = Certificate.builder()
                            .registrationId(registrationId)
                            .studentId(studentId)
                            .studentName(studentName)
                            .eventId(eventId)
                            .eventTitle(eventTitle)
                            .certificateNumber(certNumber)
                            .pdfData(pdf)
                            .build();

                    return toResponse(certificateRepository.save(certificate));
                });
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateById(Long id) {
        return certificateRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found: " + id));
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByNumber(String certNumber) {
        return certificateRepository.findByCertificateNumber(certNumber)
                .map(this::toResponse)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found: " + certNumber));
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByRegistrationId(Long registrationId) {
        return certificateRepository.findByRegistrationId(registrationId)
                .map(this::toResponse)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found for registration: " + registrationId));
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getCertificatesByStudent(String studentId) {
        return certificateRepository.findByStudentId(studentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] getPdfData(Long id) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found: " + id));
        return cert.getPdfData();
    }

    private byte[] buildPdf(String studentName, String eventTitle, String certNumber) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                PDType1Font boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font regularFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                float pageWidth = PDRectangle.A4.getWidth();
                float centerX = pageWidth / 2;

                content.beginText();
                content.setFont(boldFont, 28);
                content.newLineAtOffset(centerX - 160, 720);
                content.showText("Certificate of Participation");
                content.endText();

                content.beginText();
                content.setFont(regularFont, 16);
                content.newLineAtOffset(centerX - 80, 660);
                content.showText("This is to certify that");
                content.endText();

                content.beginText();
                content.setFont(boldFont, 20);
                float nameWidth = boldFont.getStringWidth(studentName) / 1000 * 20;
                content.newLineAtOffset(centerX - nameWidth / 2, 620);
                content.showText(studentName);
                content.endText();

                content.beginText();
                content.setFont(regularFont, 16);
                content.newLineAtOffset(centerX - 150, 580);
                content.showText("has successfully participated in");
                content.endText();

                content.beginText();
                content.setFont(boldFont, 18);
                float titleWidth = boldFont.getStringWidth(eventTitle) / 1000 * 18;
                content.newLineAtOffset(centerX - titleWidth / 2, 540);
                content.showText(eventTitle);
                content.endText();

                String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
                content.beginText();
                content.setFont(regularFont, 12);
                content.newLineAtOffset(centerX - 60, 460);
                content.showText("Date: " + date);
                content.endText();

                content.beginText();
                content.setFont(regularFont, 10);
                content.newLineAtOffset(centerX - 70, 420);
                content.showText("Certificate No: " + certNumber);
                content.endText();
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF certificate", e);
        }
    }

    private CertificateResponse toResponse(Certificate c) {
        return CertificateResponse.builder()
                .id(c.getId())
                .studentId(c.getStudentId())
                .studentName(c.getStudentName())
                .eventId(c.getEventId())
                .eventTitle(c.getEventTitle())
                .registrationId(c.getRegistrationId())
                .certificateNumber(c.getCertificateNumber())
                .issuedAt(c.getIssuedAt())
                .hasPdf(c.getPdfData() != null && c.getPdfData().length > 0)
                .build();
    }
}
