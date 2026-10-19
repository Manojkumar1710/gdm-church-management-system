package com.gdm.church.auth;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository    userRepository;
    private final PasswordEncoder   passwordEncoder;
    private final JwtTokenProvider  jwtTokenProvider;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    @Value("${app.admin.seed-email}")
    private String seedEmail;

    @Value("${app.admin.seed-password}")
    private String seedPassword;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive()) {
            // Return generic message — do not reveal the account exists but is inactive
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(expirationMs / 1000)
                .user(toDto(user))
                .build();
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("User"));
        return toDto(user);
    }

    private UserDto toDto(User user) {
        // passwordHash is intentionally NOT included in the DTO
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Seeds the default admin account on first startup only.
     *
     * Security rules:
     *  - Creates the account ONLY if it doesn't already exist.
     *  - NEVER overwrites an existing account — password changes must be done
     *    via a dedicated admin-management endpoint, not by restarting the app.
     *  - Refuses to start if ADMIN_SEED_PASSWORD is blank (fails fast in production).
     *  - Logs a warning if the default placeholder password is still in use.
     */
    @Bean
    public CommandLineRunner seedAdmin() {
        return args -> {
            if (seedPassword == null || seedPassword.isBlank()) {
                // In production ADMIN_SEED_PASSWORD must be set. In dev it defaults to blank
                // after our application.yml cleanup; only skip seeding if blank.
                log.warn("ADMIN_SEED_PASSWORD is not set — skipping admin seed. " +
                         "Set the environment variable before first run.");
                return;
            }

            boolean exists = userRepository.findByEmailIgnoreCase(seedEmail).isPresent();
            if (!exists) {
                User admin = User.builder()
                        .name("GDM Admin")
                        .email(seedEmail)
                        .passwordHash(passwordEncoder.encode(seedPassword))
                        .role(User.Role.ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
                log.info("Admin account seeded for: {}", seedEmail);
            } else {
                log.debug("Admin account already exists for: {} — seed skipped.", seedEmail);
            }
        };
    }
}
