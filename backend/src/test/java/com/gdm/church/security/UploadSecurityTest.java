package com.gdm.church.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gdm.church.auth.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests that unauthorized users cannot upload files,
 * and that invalid file types are rejected regardless of authentication.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UploadSecurityTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // Minimal valid JPEG (2x2 pixels, uncompressed approximation for magic bytes)
    private static final byte[] FAKE_JPEG = new byte[]{
        (byte)0xFF, (byte)0xD8, (byte)0xFF, (byte)0xE0,
        0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
    };

    // Minimal valid PNG header
    private static final byte[] FAKE_PNG = new byte[]{
        (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D
    };

    @Test
    @DisplayName("Uploading an event image without authentication returns 401")
    void uploadEventImage_noToken_returns401() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
            "image", "test.jpg", "image/jpeg", FAKE_JPEG);

        mockMvc.perform(multipart("/api/v1/admin/events/999/image").file(image))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Uploading a gallery image without authentication returns 401")
    void uploadGalleryImage_noToken_returns401() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
            "image", "test.jpg", "image/jpeg", FAKE_JPEG);

        mockMvc.perform(multipart("/api/v1/admin/gallery").file(image))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("File with disallowed type (text/plain) is rejected even with valid token")
    void uploadInvalidMimeType_rejectedByValidation() throws Exception {
        String token = obtainAdminToken();

        // Gallery endpoint expects param name "file"
        MockMultipartFile textFile = new MockMultipartFile(
            "file", "evil.txt", "text/plain", "I am not an image".getBytes());

        mockMvc.perform(multipart("/api/v1/admin/gallery")
               .file(textFile)
               .param("title", "test")
               .header("Authorization", "Bearer " + token))
               .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("File declaring image/jpeg but containing HTML is rejected (magic byte check)")
    void uploadHtmlDisguisedAsJpeg_rejected() throws Exception {
        String token = obtainAdminToken();

        byte[] htmlBytes = "<html><script>alert(1)</script></html>".getBytes();
        // Gallery endpoint expects param name "file"
        MockMultipartFile htmlFile = new MockMultipartFile(
            "file", "evil.jpg", "image/jpeg", htmlBytes);  // wrong magic bytes

        mockMvc.perform(multipart("/api/v1/admin/gallery")
               .file(htmlFile)
               .param("title", "test")
               .header("Authorization", "Bearer " + token))
               .andExpect(status().isBadRequest());
    }

    // ── helpers ──────────────────────────────────────────────────────

    private String obtainAdminToken() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test-admin@gdmchurch.org");
        req.setPassword("TestPass@123");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                           .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                                   .path("data").path("token").asText();
        assertThat(token).isNotBlank();
        return token;
    }
}
