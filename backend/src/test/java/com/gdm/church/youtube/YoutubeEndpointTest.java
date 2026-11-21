package com.gdm.church.youtube;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the new GET /api/v1/youtube/{id} endpoint.
 *
 * Uses the same in-memory H2 "test" profile as SecurityEndpointTest.
 * The database starts empty, so we verify 404 for non-existent IDs
 * and that the endpoint is public (no JWT required).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class YoutubeEndpointTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/youtube/{id} — public, no token needed (empty DB returns 404)")
    void getById_publicEndpoint_noTokenNeeded() throws Exception {
        // The endpoint must be reachable without a token.
        // With an empty test DB it returns 404 (not 401 / 403).
        mockMvc.perform(get("/api/v1/youtube/999"))
               .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/youtube/{id} — non-numeric ID returns 500 (type mismatch, existing handler behaviour)")
    void getById_nonNumericId_returns500() throws Exception {
        // MethodArgumentTypeMismatchException is not explicitly handled, so it falls
        // through to the generic Exception handler which returns 500 — expected behaviour.
        String body = mockMvc.perform(get("/api/v1/youtube/abc"))
               .andExpect(status().isInternalServerError())
               .andReturn().getResponse().getContentAsString();

        // Even on 500, no stack trace must be leaked
        org.assertj.core.api.Assertions.assertThat(body).doesNotContain("at com.");
        org.assertj.core.api.Assertions.assertThat(body).doesNotContain("java.lang");
    }

    @Test
    @DisplayName("GET /api/v1/youtube/{id} — 404 response does not leak stack traces")
    void getById_notFound_noStackTrace() throws Exception {
        String body = mockMvc.perform(get("/api/v1/youtube/999"))
               .andExpect(status().isNotFound())
               .andReturn().getResponse().getContentAsString();

        org.assertj.core.api.Assertions.assertThat(body).doesNotContain("at com.");
        org.assertj.core.api.Assertions.assertThat(body).doesNotContain("java.lang");
        org.assertj.core.api.Assertions.assertThat(body).doesNotContain("NullPointer");
    }

    @Test
    @DisplayName("GET /api/v1/youtube — existing list endpoint still works (not broken by new endpoint)")
    void existingListEndpoint_stillWorks() throws Exception {
        mockMvc.perform(get("/api/v1/youtube"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.success").value(true));
    }
}
