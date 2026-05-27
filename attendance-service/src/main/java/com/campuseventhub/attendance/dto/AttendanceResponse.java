package com.campuseventhub.attendance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceResponse {
    private Long id;
    private Long registrationId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime markedAt;
    private String status;
}
