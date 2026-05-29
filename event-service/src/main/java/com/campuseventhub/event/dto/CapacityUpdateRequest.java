package com.campuseventhub.event.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CapacityUpdateRequest {
    @Min(value = -1, message = "delta must be -1 (cancel) or +1 (register)")
    @Max(value =  1, message = "delta must be -1 (cancel) or +1 (register)")
    private int delta;
}
