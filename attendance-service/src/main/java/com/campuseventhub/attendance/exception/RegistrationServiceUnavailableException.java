package com.campuseventhub.attendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class RegistrationServiceUnavailableException extends RuntimeException {
    public RegistrationServiceUnavailableException() {
        super("Registration service unavailable. Please try again later.");
    }
}
