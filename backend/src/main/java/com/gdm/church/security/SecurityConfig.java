package com.gdm.church.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthEntryPoint))
            .authorizeHttpRequests(auth -> auth

                // Public auth
                .requestMatchers("/api/v1/auth/login").permitAll()

                // Public GET endpoints
                .requestMatchers(HttpMethod.GET, "/api/v1/church/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/hero/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/event-photos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/pastors/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/pastor-schedule/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/sermons/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/youtube/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/gallery/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/offering-purposes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/sunday-school/programs/**").permitAll()

                // Public POST submissions
                .requestMatchers(HttpMethod.POST, "/api/v1/offerings").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/prayer-requests").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/contact-messages").permitAll()

                // Swagger/OpenAPI
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()

                // Sunday School — ADMIN or SUNDAY_SCHOOL_TEACHER
                .requestMatchers("/api/v1/admin/sunday-school/**")
                    .hasAnyRole("ADMIN", "SUNDAY_SCHOOL_TEACHER")

                // Everything else requires ADMIN role
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().hasRole("ADMIN")
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
