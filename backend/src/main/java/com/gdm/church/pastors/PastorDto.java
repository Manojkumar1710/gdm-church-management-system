package com.gdm.church.pastors;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PastorDto {
    private Long id;

    @NotBlank(message = "Pastor name is required")
    private String name;

    private String village;
    private String contactNumber;   // only included on admin calls
    private String email;
    private String photoUrl;
    private String bio;
    private boolean active;
    private boolean contactPublic;
    private Instant createdAt;
}
