package com.campuseventhub.attendance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceStatusResponse {
    private boolean present;
    private LocalDateTime markedAt;
}
