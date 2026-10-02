package com.gdm.church.auth;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean active;
    private Instant createdAt;
    // NOTE: password hash is NEVER included
}
