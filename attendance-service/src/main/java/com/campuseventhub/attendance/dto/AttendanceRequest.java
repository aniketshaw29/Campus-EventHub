package com.campuseventhub.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRequest {
    @NotNull(message = "registrationId is required")
    private Long registrationId;

    @NotBlank(message = "studentId is required")
    private String studentId;

    @NotNull(message = "eventId is required")
    private Long eventId;

    private String studentName;
    private String studentEmail;
    private String eventTitle;
}
