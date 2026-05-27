package com.campuseventhub.certificate.controller;

import com.campuseventhub.certificate.dto.CertificateResponse;
import com.campuseventhub.certificate.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/{id}")
    public ResponseEntity<CertificateResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getCertificateById(id));
    }

    @GetMapping("/number/{certNumber}")
    public ResponseEntity<CertificateResponse> getByNumber(@PathVariable String certNumber) {
        return ResponseEntity.ok(certificateService.getCertificateByNumber(certNumber));
    }

    @GetMapping("/registration/{registrationId}")
    public ResponseEntity<CertificateResponse> getByRegistrationId(@PathVariable Long registrationId) {
        return ResponseEntity.ok(certificateService.getCertificateByRegistrationId(registrationId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CertificateResponse>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(certificateService.getCertificatesByStudent(studentId));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdf = certificateService.getPdfData(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate-" + id + ".pdf\"")
                .body(pdf);
    }
}
