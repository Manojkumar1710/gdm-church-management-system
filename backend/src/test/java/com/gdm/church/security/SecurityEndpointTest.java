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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security integration tests.
 *
 * Verifies:
 *  - Public GET endpoints are accessible without a token
 *  - Admin endpoints return 401 without a token
 *  - Login with valid credentials returns a JWT
 *  - Login with bad credentials returns 401
 *  - Admin endpoints are accessible with a valid JWT
 *  - Private data endpoints (offerings, prayer requests) reject public access
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityEndpointTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ----------------------------------------------------------------
    // Public endpoints — no token required
    // ----------------------------------------------------------------

    @Test
    @DisplayName("GET /api/v1/church — public, no token needed")
    void getChurch_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/church"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/events — public, no token needed")
    void getEvents_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/events"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/event-photos/latest — public, no token needed")
    void getLatestPhotos_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/event-photos/latest"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/pastors — public, no token needed")
    void getPastors_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/pastors"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/offering-purposes — public, no token needed")
    void getOfferingPurposes_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/offering-purposes"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/sunday-school/programs — public, no token needed")
    void getSundaySchoolPrograms_public_succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/sunday-school/programs"))
                .andExpect(status().isOk());
    }

    // ----------------------------------------------------------------
    // Admin endpoints — 401 without token
    // ----------------------------------------------------------------

    @Test
    @DisplayName("GET /api/v1/admin/dashboard — 401 without token")
    void adminDashboard_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/admin/offerings — 401 without token (donor data private)")
    void adminOfferings_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/offerings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/admin/prayer-requests — 401 without token (prayer data private)")
    void adminPrayerRequests_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/prayer-requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/admin/sunday-school/children — 401 without token (child PII private)")
    void adminChildren_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/sunday-school/children"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/admin/contact-messages — 401 without token")
    void adminContactMessages_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/contact-messages"))
                .andExpect(status().isUnauthorized());
    }

    // ----------------------------------------------------------------
    // Login flow
    // ----------------------------------------------------------------

    @Test
    @DisplayName("POST /api/v1/auth/login — valid credentials return 200 + token")
    void login_validCredentials_returnsToken() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test-admin@gdmchurch.org");
        req.setPassword("TestPass@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("test-admin@gdmchurch.org"))
                .andExpect(jsonPath("$.data.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login — wrong password returns 401")
    void login_wrongPassword_returns401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test-admin@gdmchurch.org");
        req.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login — unknown email returns 401")
    void login_unknownEmail_returns401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("nobody@gdmchurch.org");
        req.setPassword("AnyPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login — blank email returns 400")
    void login_blankEmail_returns400() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("");
        req.setPassword("SomePassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ----------------------------------------------------------------
    // Authenticated admin access
    // ----------------------------------------------------------------

    @Test
    @DisplayName("GET /api/v1/admin/dashboard — 200 with valid token")
    void adminDashboard_withToken_returns200() throws Exception {
        String token = loginAndGetToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isMap());
    }

    @Test
    @DisplayName("GET /api/v1/admin/offerings — 200 with valid token")
    void adminOfferings_withToken_returns200() throws Exception {
        String token = loginAndGetToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/offerings")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/admin/prayer-requests — 200 with valid token")
    void adminPrayer_withToken_returns200() throws Exception {
        String token = loginAndGetToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/prayer-requests")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/admin/sunday-school/children — 200 with valid token (PII protected)")
    void adminChildren_withToken_returns200() throws Exception {
        String token = loginAndGetToken("test-admin@gdmchurch.org", "TestPass@123");

        mockMvc.perform(get("/api/v1/admin/sunday-school/children")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Invalid token returns 401")
    void invalidToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer this.is.not.a.valid.jwt"))
                .andExpect(status().isUnauthorized());
    }

    // ----------------------------------------------------------------
    // Helper
    // ----------------------------------------------------------------

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        // Extract token from: {"success":true,"data":{"token":"<jwt>", ...}}
        String token = objectMapper.readTree(body).path("data").path("token").asText();
        assertThat(token).isNotBlank();
        return token;
    }
}
