package com.gdm.church.contact;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContactDto {
    private Long id;
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;
    private String phone;
    private String subject;
    @NotBlank(message = "Message is required")
    @Size(min = 5, max = 3000, message = "Message must be 5–3000 characters")
    private String message;
    private String status;
    private Instant createdAt;
}
