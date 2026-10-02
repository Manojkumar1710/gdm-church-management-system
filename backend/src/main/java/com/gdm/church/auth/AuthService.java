package com.gdm.church.auth;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

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
            throw ApiException.forbidden("Your account has been deactivated");
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
     * Seeds the default admin account on startup.
     * - Creates the account if it doesn't exist yet.
     * - ALWAYS updates the password hash to match the current ADMIN_SEED_PASSWORD
     *   so changing the config value takes effect on next restart.
     */
    @Bean
    public CommandLineRunner seedAdmin() {
        return args -> {
            User admin = userRepository.findByEmailIgnoreCase(seedEmail)
                    .orElse(null);

            if (admin == null) {
                // First-time creation
                admin = User.builder()
                        .name("GDM Admin")
                        .email(seedEmail)
                        .passwordHash(passwordEncoder.encode(seedPassword))
                        .role(User.Role.ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
            } else if (!passwordEncoder.matches(seedPassword, admin.getPasswordHash())) {
                // Password in config changed — update the hash
                admin.setPasswordHash(passwordEncoder.encode(seedPassword));
                userRepository.save(admin);
            }
        };
    }
}
