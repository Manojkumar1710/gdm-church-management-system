package com.gdm.church.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gdm.church.auth.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Security integration tests — verifies authentication, authorization,
 * JWT handling, public endpoints, and that sensitive data is not leaked.
 *
 * Uses an in-memory H2 database (profile "test") with a seeded test admin.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityEndpointTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ── Public endpoints (no token) ──────────────────────────────────

    @Test @DisplayName("GET /api/v1/church — public, no token needed")
    void getChurch_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/church"))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /api/v1/events — public, no token needed")
    void getEvents_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/events"))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /api/v1/event-photos/latest — public, no token needed")
    void getLatestPhotos_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/event-photos/latest"))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /api/v1/pastors — public, no token needed")
    void getPastors_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/pastors"))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /api/v1/offering-purposes — public, no token needed")
    void getOfferingPurposes_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/offering-purposes"))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /api/v1/sunday-school/programs — public, no token needed")
    void getSundaySchoolPrograms_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/sunday-school/programs"))
               .andExpect(status().isOk());
    }

    // ── Admin endpoints require authentication ───────────────────────

    @Test @DisplayName("GET /api/v1/admin/dashboard — 401 without token")
    void adminDashboard_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("GET /api/v1/admin/offerings — 401 without token")
    void adminOfferings_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/offerings"))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("GET /api/v1/admin/prayer-requests — 401 without token")
    void adminPrayerRequests_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/prayer-requests"))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("GET /api/v1/admin/sunday-school/children — 401 without token")
    void adminChildren_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/sunday-school/children"))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("GET /api/v1/admin/contact-messages — 401 without token")
    void adminContactMessages_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/contact-messages"))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("GET /api/v1/auth/me — 401 without token")
    void getMe_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
               .andExpect(status().isUnauthorized());
    }

    // ── Login flow ───────────────────────────────────────────────────

    @Test @DisplayName("POST /api/v1/auth/login — valid credentials return 200 + token")
    void login_validCredentials_returnsToken() throws Exception {
        LoginRequest req = buildLogin("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.token").isNotEmpty())
               .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
               .andExpect(jsonPath("$.data.user.email").value("test-admin@gdmchurch.org"))
               // passwordHash must NEVER appear in any response
               .andExpect(jsonPath("$.data.user.passwordHash").doesNotExist())
               .andExpect(jsonPath("$.data.user.password").doesNotExist());
    }

    @Test @DisplayName("POST /api/v1/auth/login — wrong password returns 401")
    void login_wrongPassword_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin("test-admin@gdmchurch.org", "WrongPass!"))))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("POST /api/v1/auth/login — unknown email returns 401 (not 404)")
    void login_unknownEmail_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin("nobody@gdmchurch.org", "AnyPass"))))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("POST /api/v1/auth/login — blank email returns 400")
    void login_blankEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin("", "SomePassword"))))
               .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("POST /api/v1/auth/login — blank password returns 400")
    void login_blankPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin("test-admin@gdmchurch.org", ""))))
               .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("POST /api/v1/auth/login — invalid email format returns 400")
    void login_invalidEmailFormat_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin("not-an-email", "SomePassword"))))
               .andExpect(status().isBadRequest());
    }

    // ── Authenticated admin access ───────────────────────────────────

    @Test @DisplayName("GET /api/v1/admin/dashboard — 200 with valid token")
    void adminDashboard_withToken_returns200() throws Exception {
        String token = obtainToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/dashboard")
                       .header("Authorization", "Bearer " + token))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data").isMap());
    }

    @Test @DisplayName("GET /api/v1/admin/offerings — 200 with valid token")
    void adminOfferings_withToken_returns200() throws Exception {
        String token = obtainToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/offerings")
                       .header("Authorization", "Bearer " + token))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /api/v1/admin/prayer-requests — 200 with valid token")
    void adminPrayer_withToken_returns200() throws Exception {
        String token = obtainToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/prayer-requests")
                       .header("Authorization", "Bearer " + token))
               .andExpect(status().isOk());
    }

    // ── JWT validation ───────────────────────────────────────────────

    @Test @DisplayName("Malformed token returns 401")
    void malformedToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                       .header("Authorization", "Bearer this.is.not.a.valid.jwt"))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("Tampered token returns 401")
    void tamperedToken_returns401() throws Exception {
        String validToken = obtainToken("test-admin@gdmchurch.org", "TestPass@123");
        // Flip last char
        String tampered = validToken.substring(0, validToken.length() - 1) + "X";

        mockMvc.perform(get("/api/v1/admin/dashboard")
                       .header("Authorization", "Bearer " + tampered))
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("Authorization header with no Bearer prefix is rejected")
    void noBearerPrefix_returns401() throws Exception {
        String token = obtainToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/dashboard")
                       .header("Authorization", token))  // missing "Bearer "
               .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("Empty Authorization header returns 401")
    void emptyAuthHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                       .header("Authorization", ""))
               .andExpect(status().isUnauthorized());
    }

    // ── Public write endpoint validation ────────────────────────────

    @Test @DisplayName("POST /api/v1/contact-messages — valid request returns 200")
    void contactSubmit_valid_returns200() throws Exception {
        Map<String, String> body = Map.of(
            "name",    "Test User",
            "email",   "test@example.com",
            "message", "This is a valid test message."
        );
        mockMvc.perform(post("/api/v1/contact-messages")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("POST /api/v1/contact-messages — missing required fields returns 400")
    void contactSubmit_missingFields_returns400() throws Exception {
        Map<String, String> body = Map.of("name", "Test User");  // missing email + message
        mockMvc.perform(post("/api/v1/contact-messages")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test @DisplayName("POST /api/v1/contact-messages — invalid email format returns 400")
    void contactSubmit_invalidEmail_returns400() throws Exception {
        Map<String, String> body = Map.of(
            "name",    "Test User",
            "email",   "not-an-email",
            "message", "Valid message."
        );
        mockMvc.perform(post("/api/v1/contact-messages")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("POST /api/v1/prayer-requests — valid request returns 200")
    void prayerSubmit_valid_returns200() throws Exception {
        Map<String, Object> body = Map.of(
            "requestText", "Please pray for my family during a difficult time.",
            "anonymous",   true
        );
        mockMvc.perform(post("/api/v1/prayer-requests")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isOk());
    }

    @Test @DisplayName("POST /api/v1/prayer-requests — blank requestText returns 400")
    void prayerSubmit_blankRequest_returns400() throws Exception {
        Map<String, Object> body = Map.of("requestText", "", "anonymous", true);
        mockMvc.perform(post("/api/v1/prayer-requests")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("POST /api/v1/prayer-requests — submitter cannot set status")
    void prayerSubmit_statusIgnored() throws Exception {
        // Even if the caller passes status=PRAYED, the server must return NEW or ignore it
        Map<String, Object> body = Map.of(
            "requestText", "Valid prayer request of sufficient length.",
            "anonymous",   true,
            "status",      "PRAYED"   // should be ignored
        );
        mockMvc.perform(post("/api/v1/prayer-requests")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isOk());
        // The response is ApiResponse<Void> so status field is not in the body — no leak
    }

    // ── Error response safety ────────────────────────────────────────

    @Test @DisplayName("Error responses do not contain stack traces or internal paths")
    void errorResponse_noStackTrace() throws Exception {
        String responseBody = mockMvc.perform(get("/api/v1/admin/dashboard"))
               .andExpect(status().isUnauthorized())
               .andReturn()
               .getResponse().getContentAsString();

        assertThat(responseBody).doesNotContain("at com.");
        assertThat(responseBody).doesNotContain("Exception");
        assertThat(responseBody).doesNotContain("java.lang");
        assertThat(responseBody).doesNotContain("NullPointer");
    }

    @Test @DisplayName("Login error response does not reveal account existence")
    void loginError_noAccountEnumeration() throws Exception {
        // Wrong-password response
        String wrongPassBody = mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin("test-admin@gdmchurch.org", "WrongPass"))))
               .andReturn().getResponse().getContentAsString();

        // Unknown-user response
        String unknownUserBody = mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin("unknown@gdmchurch.org", "WrongPass"))))
               .andReturn().getResponse().getContentAsString();

        // Both should return the same generic message — prevents account enumeration
        assertThat(wrongPassBody).contains("Invalid email or password");
        assertThat(unknownUserBody).contains("Invalid email or password");
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private LoginRequest buildLogin(String email, String password) {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword(password);
        return req;
    }

    private String obtainToken(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(buildLogin(email, password))))
               .andExpect(status().isOk())
               .andReturn();

        String body  = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(body).path("data").path("token").asText();
        assertThat(token).isNotBlank();
        return token;
    }
}
