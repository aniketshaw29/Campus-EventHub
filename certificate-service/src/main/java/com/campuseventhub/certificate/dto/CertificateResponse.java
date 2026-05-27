package com.campuseventhub.certificate.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CertificateResponse {
    private Long id;
    private String studentId;
    private String studentName;
    private Long eventId;
    private String eventTitle;
    private Long registrationId;
    private String certificateNumber;
    private LocalDateTime issuedAt;
    private boolean hasPdf;
}
