package com.gdm.church.church;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ChurchDto {
    private Long id;
    @NotBlank(message = "Church name is required")
    private String name;
    private String tagline;
    private String description;
    private String history;
    private String vision;
    private String mission;
    private String address;
    private String phone;
    @Email(message = "Invalid email")
    private String email;
    private String mapUrl;
    private Instant updatedAt;
}
