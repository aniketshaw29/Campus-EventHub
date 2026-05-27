package com.campuseventhub.attendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class AttendanceNotFoundException extends RuntimeException {
    public AttendanceNotFoundException(String msg) { super(msg); }
}
