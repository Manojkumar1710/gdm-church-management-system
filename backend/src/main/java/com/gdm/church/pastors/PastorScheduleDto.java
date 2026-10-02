package com.gdm.church.pastors;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PastorScheduleDto {
    private Long id;

    @NotNull(message = "Pastor ID is required")
    private Long pastorId;

    private String pastorName;
    private String pastorVillage;

    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;

    private String serviceType;
    private LocalTime startTime;
    private LocalTime endTime;
    private String notes;
}
