package com.gdm.church.deployment;

import com.gdm.church.GdmChurchApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

/**
 * Deployment-safety test for the Docker image configuration.
 *
 * Under the {@code render} profile, required secrets have NO defaults in
 * {@code application-render.yml}. This is what guarantees the image contains
 * no secrets: if the host environment forgets one, the app must fail fast at
 * startup rather than silently fall back to a baked-in value.
 *
 * Each test boots the real application under the {@code render} profile with
 * every secret supplied except one, and asserts that startup fails with a
 * message pointing at the missing variable. A unique in-memory H2 database per
 * test lets the boot progress past the database layer so the failure is the
 * missing secret, not a connection issue.
 *
 * Note: DB_PASSWORD is bound through Spring Boot's {@code @ConfigurationProperties}
 * (DataSourceProperties), which does not surface an unresolvable placeholder the
 * same way {@code @Value} does. Its "no default" guarantee is therefore enforced
 * statically in application-render.yml and verified for the real image by the
 * Docker fail-fast test (run the image without the secret and assert it exits).
 */
class RenderProfileFailFastTest {

    /** All required environment variables with throwaway values. */
    private static final Map<String, String> ALL_SECRETS = new LinkedHashMap<>();
    static {
        ALL_SECRETS.put("DB_PASSWORD", "x");
        ALL_SECRETS.put("JWT_SECRET", "test-jwt-secret-for-render-profile-min-32-characters");
        ALL_SECRETS.put("CLOUDINARY_CLOUD_NAME", "x");
        ALL_SECRETS.put("CLOUDINARY_API_KEY", "x");
        ALL_SECRETS.put("CLOUDINARY_API_SECRET", "x");
        ALL_SECRETS.put("FRONTEND_URL", "http://localhost:5173");
        ALL_SECRETS.put("ADMIN_SEED_EMAIL", "admin@gdmchurch.org");
        ALL_SECRETS.put("ADMIN_SEED_PASSWORD", "TestAdmin@123");
        ALL_SECRETS.put("JWT_EXPIRATION_MS", "3600000");
    }

    @Test
    @DisplayName("render profile fails fast when JWT_SECRET is missing")
    void jwtSecretMissing() {
        assertFailsFast("JWT_SECRET");
    }

    @Test
    @DisplayName("render profile fails fast when CLOUDINARY_API_SECRET is missing")
    void cloudinaryApiSecretMissing() {
        assertFailsFast("CLOUDINARY_API_SECRET");
    }

    private void assertFailsFast(String missingSecret) {
        // Unique in-memory H2 database per test so cross-test state cannot interfere.
        String dbName = "gdm_render_fail_" + missingSecret.toLowerCase().replace("_", "");

        List<String> args = new ArrayList<>();
        args.add("--spring.profiles.active=render");
        args.add("--spring.datasource.url=jdbc:h2:mem:" + dbName + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        args.add("--spring.datasource.driver-class-name=org.h2.Driver");
        args.add("--spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect");
        args.add("--spring.jpa.hibernate.ddl-auto=none");
        ALL_SECRETS.forEach((key, value) -> {
            if (!key.equals(missingSecret)) {
                args.add("--" + key + "=" + value);
            }
        });

        Throwable thrown = catchThrowable(() ->
                new SpringApplicationBuilder(GdmChurchApplication.class)
                        .web(WebApplicationType.NONE)
                        .run(args.toArray(new String[0])));

        assertThat(thrown)
                .as("startup must fail when %s is missing", missingSecret)
                .isNotNull();
        assertThat(rootCause(thrown).getMessage())
                .as("the failure must point at the missing secret, not an unrelated error")
                .containsIgnoringCase(missingSecret);
    }

    private static Throwable rootCause(Throwable t) {
        Throwable r = t;
        while (r.getCause() != null && r.getCause() != r) {
            r = r.getCause();
        }
        return r;
    }
}
