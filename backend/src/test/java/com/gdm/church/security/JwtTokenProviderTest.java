package com.gdm.church.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for JwtTokenProvider.
 * No Spring context — tests the JWT logic in isolation.
 */
class JwtTokenProviderTest {

    private static final String SECRET     = "test-jwt-secret-key-for-unit-tests-only-32-chars";
    private static final long   EXPIRY_MS  = 3_600_000L;   // 1 hour

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider(SECRET, EXPIRY_MS);
    }

    @Test @DisplayName("Generated token is not blank")
    void generateToken_notBlank() {
        String token = provider.generateToken("user@test.com", "ADMIN");
        assertThat(token).isNotBlank();
    }

    @Test @DisplayName("Email claim is correctly stored and retrieved")
    void emailClaim_roundtrip() {
        String token = provider.generateToken("user@test.com", "ADMIN");
        assertThat(provider.getEmailFromToken(token)).isEqualTo("user@test.com");
    }

    @Test @DisplayName("Role claim is correctly stored and retrieved")
    void roleClaim_roundtrip() {
        String token = provider.generateToken("user@test.com", "SUPER_ADMIN");
        assertThat(provider.getRoleFromToken(token)).isEqualTo("SUPER_ADMIN");
    }

    @Test @DisplayName("Valid token passes validation")
    void validToken_passesValidation() {
        String token = provider.generateToken("user@test.com", "ADMIN");
        assertThat(provider.validateToken(token)).isTrue();
    }

    @Test @DisplayName("Tampered token fails validation")
    void tamperedToken_failsValidation() {
        String token   = provider.generateToken("user@test.com", "ADMIN");
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertThat(provider.validateToken(tampered)).isFalse();
    }

    @Test @DisplayName("Malformed string fails validation")
    void malformedString_failsValidation() {
        assertThat(provider.validateToken("not.a.jwt")).isFalse();
    }

    @Test @DisplayName("Blank string fails validation")
    void blankString_failsValidation() {
        assertThat(provider.validateToken("")).isFalse();
    }

    @Test @DisplayName("null input fails validation")
    void nullInput_failsValidation() {
        assertThat(provider.validateToken(null)).isFalse();
    }

    @Test @DisplayName("Expired token fails validation")
    void expiredToken_failsValidation() throws InterruptedException {
        // Create provider with 1ms expiry
        JwtTokenProvider shortProvider = new JwtTokenProvider(SECRET, 1L);
        String token = shortProvider.generateToken("user@test.com", "ADMIN");
        Thread.sleep(10);  // ensure expiry
        assertThat(shortProvider.validateToken(token)).isFalse();
    }

    @Test @DisplayName("Secret shorter than 32 chars throws on construction")
    void shortSecret_throwsOnConstruction() {
        assertThatThrownBy(() -> new JwtTokenProvider("tooshort", EXPIRY_MS))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("32");
    }

    @Test @DisplayName("Token from a different secret fails validation")
    void wrongSecretToken_failsValidation() {
        JwtTokenProvider otherProvider = new JwtTokenProvider(
            "completely-different-secret-key-32-bytes-long", EXPIRY_MS);
        String token = otherProvider.generateToken("user@test.com", "ADMIN");
        // Validate against the original provider — should fail
        assertThat(provider.validateToken(token)).isFalse();
    }
}
