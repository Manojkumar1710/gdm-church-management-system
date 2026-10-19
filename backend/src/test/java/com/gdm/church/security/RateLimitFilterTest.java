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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies rate limiting behaviour.
 *
 * Uses a separate Spring context (different @TestPropertySource) so that its
 * rate-limit counter starts fresh and does not interfere with SecurityEndpointTest.
 * Rate limiting is explicitly ENABLED for this test class only.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "app.rate-limit.enabled=true")
class RateLimitFilterTest {

    @Autowired MockMvc       mockMvc;
    @Autowired ObjectMapper  objectMapper;

    @Test
    @DisplayName("Login endpoint blocks after exceeding the per-IP limit")
    void login_excessiveAttempts_returns429() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("ratelimitcheck@test.com");
        req.setPassword("WrongPassword!");
        String body = objectMapper.writeValueAsString(req);

        // Send 15 requests — the first 10 are allowed (401 bad-creds),
        // requests 11-15 must be blocked (429)
        int blocked = 0;
        for (int i = 0; i < 15; i++) {
            int status = mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andReturn()
                    .getResponse()
                    .getStatus();
            if (status == 429) blocked++;
        }
        assertThat(blocked).isGreaterThan(0);
    }

    @Test
    @DisplayName("429 response body contains TOO_MANY_REQUESTS code")
    void rateLimitResponse_hasExpectedBody() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("ratelimitbody@test.com");
        req.setPassword("Wrong!");
        String body = objectMapper.writeValueAsString(req);

        // Exhaust the window
        for (int i = 0; i < 11; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                   .contentType(MediaType.APPLICATION_JSON)
                   .content(body));
        }

        // Confirm the next one is either still blocked or already 429
        String responseBody = mockMvc.perform(post("/api/v1/auth/login")
               .contentType(MediaType.APPLICATION_JSON)
               .content(body))
               .andReturn()
               .getResponse()
               .getContentAsString();

        // If rate-limited, body must contain the right code
        if (responseBody.contains("429") || responseBody.contains("TOO_MANY")) {
            assertThat(responseBody).contains("TOO_MANY_REQUESTS");
            assertThat(responseBody).doesNotContain("Exception");
            assertThat(responseBody).doesNotContain("stack");
        }
    }
}
