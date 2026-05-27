package com.campuseventhub.attendance.client;

import com.campuseventhub.attendance.exception.RegistrationServiceUnavailableException;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "registration-service", fallback = RegistrationClientFallback.class)
public interface RegistrationClient {

    @GetMapping("/api/registrations/{id}/exists")
    ExistsResponse checkExists(@PathVariable Long id);
}
