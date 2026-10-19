package com.gdm.church.contact;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContactDto {
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    @Size(max = 180, message = "Email must not exceed 180 characters")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Pattern(regexp = "^[+\\d\\s\\-()]*$", message = "Phone contains invalid characters")
    private String phone;

    @Size(max = 200, message = "Subject must not exceed 200 characters")
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(min = 5, max = 3000, message = "Message must be 5–3000 characters")
    private String message;

    /** Read-only — set by admin. */
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private String status;

    /** Read-only — set by server. */
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Instant createdAt;
}
