package com.campuseventhub.certificate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "event_title")
    private String eventTitle;

    @Column(name = "registration_id", nullable = false, unique = true)
    private Long registrationId;

    @Column(name = "certificate_number", nullable = false, unique = true)
    private String certificateNumber;

    @CreationTimestamp
    private LocalDateTime issuedAt;

    @Lob
    @Column(name = "pdf_data")
    private byte[] pdfData;
}
