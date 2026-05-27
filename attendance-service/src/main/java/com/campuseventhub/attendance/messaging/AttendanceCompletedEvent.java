package com.campuseventhub.attendance.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCompletedEvent {
    private Long attendanceId;
    private Long registrationId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime markedAt;
}
