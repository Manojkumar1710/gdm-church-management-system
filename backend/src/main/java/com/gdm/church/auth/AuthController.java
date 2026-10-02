package com.gdm.church.auth;

import com.gdm.church.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    /**
     * Returns the currently authenticated admin's profile.
     *
     * Previously used @RequestAttribute("email") which required the JWT filter
     * to set a servlet request attribute — it never did, causing a 500 on every
     * call to this endpoint.
     *
     * The JwtAuthFilter sets the email as the principal name in SecurityContext.
     * We read it from there instead, which is the correct approach.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // JwtAuthFilter sets email as the principal name
        UserDto userDto = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }
}
