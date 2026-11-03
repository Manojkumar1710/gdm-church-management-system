package com.gdm.church.deployment;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Deployment-readiness test for the Docker image configuration.
 *
 * Boots the application under the {@code render} profile — the exact
 * {@code application-render.yml} that is baked into the Docker image — with
 * every required secret supplied as a property and an in-memory H2 database
 * standing in for the production MySQL.
 *
 * What this proves before you deploy:
 *   • {@code application-render.yml} is complete and self-sufficient (the
 *     context starts with no other config file present).
 *   • Render's {@code PORT} environment variable maps onto {@code server.port}
 *     (the bug that existed when the gitignored application.yml was absent).
 *   • Every required secret binds from the environment, and the non-secret
 *     config that has no env var (JPA ddl-auto, multipart limits, Jackson,
 *     CORS, admin seed) is still present.
 *
 * Secrets use throwaway values, so no real credential is needed to run this.
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = {
                // In-memory H2 stands in for the production MySQL
                "spring.datasource.url=jdbc:h2:mem:gdm_render_ok;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",

                // Required secrets (throwaway values)
                "DB_PASSWORD=test-db-password",
                "JWT_SECRET=test-jwt-secret-for-render-profile-min-32-characters",
                "CLOUDINARY_CLOUD_NAME=test-cloud",
                "CLOUDINARY_API_KEY=test-key",
                "CLOUDINARY_API_SECRET=test-secret",
                "FRONTEND_URL=https://frontend.example.com",
                "ADMIN_SEED_EMAIL=admin@gdmchurch.org",
                "ADMIN_SEED_PASSWORD=TestAdmin@123",

                // Render injects PORT at runtime
                "PORT=10000"
        })
@ActiveProfiles("render")
class RenderProfileConfigTest {

    @Autowired
    Environment env;

    @Test
    @DisplayName("render profile: context starts with all secrets provided")
    void contextStarts() {
        // Reaching this assertion means the ApplicationContext loaded successfully.
        assertThat(env).isNotNull();
    }

    @Test
    @DisplayName("render profile: PORT environment variable maps to server.port")
    void portMapsToServerPort() {
        assertThat(env.getProperty("PORT")).isEqualTo("10000");
        // The actual Render requirement: server.port resolves from ${PORT:8080}
        assertThat(env.getProperty("server.port")).isEqualTo("10000");
    }

    @Test
    @DisplayName("render profile: required secrets bind from environment variables")
    void requiredSecretsBind() {
        assertThat(env.getProperty("app.jwt.secret"))
                .isEqualTo("test-jwt-secret-for-render-profile-min-32-characters");
        assertThat(env.getProperty("cloudinary.cloud-name")).isEqualTo("test-cloud");
        assertThat(env.getProperty("cloudinary.api-key")).isEqualTo("test-key");
        assertThat(env.getProperty("cloudinary.api-secret")).isEqualTo("test-secret");
        assertThat(env.getProperty("spring.datasource.password")).isEqualTo("test-db-password");
    }

    @Test
    @DisplayName("render profile: required non-secret config is present (not excluded/lost)")
    void requiredNonSecretConfigPresent() {
        // These have no env var — they must live in application-render.yml or the app breaks.
        assertThat(env.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("update");
        assertThat(env.getProperty("server.servlet.multipart.max-file-size")).isEqualTo("25MB");
        assertThat(env.getProperty("server.servlet.multipart.max-request-size")).isEqualTo("60MB");
        assertThat(env.getProperty("spring.jackson.default-property-inclusion")).isEqualTo("non_null");
        assertThat(env.getProperty("spring.jpa.open-in-view")).isEqualTo("false");
        assertThat(env.getProperty("app.cors.allowed-origins")).isEqualTo("https://frontend.example.com");
        assertThat(env.getProperty("app.admin.seed-email")).isEqualTo("admin@gdmchurch.org");
    }
}
