package com.campuseventhub.attendance.client;

import com.campuseventhub.attendance.exception.RegistrationServiceUnavailableException;
import org.springframework.stereotype.Component;

@Component
public class RegistrationClientFallback implements RegistrationClient {

    @Override
    public ExistsResponse checkExists(Long id) {
        throw new RegistrationServiceUnavailableException();
    }
}
