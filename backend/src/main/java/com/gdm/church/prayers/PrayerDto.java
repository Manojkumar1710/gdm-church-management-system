package com.gdm.church.prayers;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrayerDto {

    /** Server-assigned — ignored on inbound submission. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @Email(message = "Invalid email format")
    @Size(max = 180, message = "Email must not exceed 180 characters")
    private String email;

    @NotBlank(message = "Prayer request cannot be blank")
    @Size(min = 10, max = 2000, message = "Request must be between 10 and 2000 characters")
    private String requestText;

    private boolean anonymous;

    /** Server-assigned — ignored on inbound submission. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String status;

    /**
     * Admin-only pastoral note.
     * The public submit endpoint returns ApiResponse&lt;Void&gt; so this field
     * never reaches a public caller. It is included in admin list/update responses
     * which are protected by @PreAuthorize("hasRole('ADMIN')").
     */
    private String pastoralNote;

    /** Server-assigned — ignored on inbound submission. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;
}
