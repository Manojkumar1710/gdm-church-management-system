package com.gdm.church.prayers;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrayerDto {
    private Long id;
    private String name;
    private String email;

    @NotBlank(message = "Prayer request cannot be blank")
    @Size(min = 10, max = 2000, message = "Request must be between 10 and 2000 characters")
    private String requestText;

    private boolean anonymous;
    private String status;
    private String pastoralNote;   // admin-only, never returned on public submit
    private Instant createdAt;
}
