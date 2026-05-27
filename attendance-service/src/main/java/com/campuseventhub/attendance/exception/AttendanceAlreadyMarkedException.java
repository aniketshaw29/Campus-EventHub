package com.campuseventhub.attendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class AttendanceAlreadyMarkedException extends RuntimeException {
    public AttendanceAlreadyMarkedException(Long registrationId) {
        super("Attendance already marked for registrationId: " + registrationId);
    }
}
