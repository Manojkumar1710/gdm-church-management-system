# ────────────────────────────────────────────────────────────────
# GDM Church Backend — Production Dockerfile
#
# Multi-stage build:
#   Stage 1 (builder) — Maven + JDK 21 compiles and packages the JAR
#   Stage 2 (runtime) — Eclipse Temurin JRE 21 runs the JAR
#
# Build from the REPOSITORY ROOT (not from backend/):
#   docker build -f backend/Dockerfile -t gdm-church-backend .
#
# All secrets (DB_URL, JWT_SECRET, CLOUDINARY_*, etc.) must be
# supplied as environment variables at runtime — they are never
# baked into this image.
# ────────────────────────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# Working directory inside the build container
WORKDIR /build

# Copy the Maven project descriptor first so Docker can cache the
# dependency-download layer separately from the source code.
COPY backend/pom.xml ./pom.xml

# Download all dependencies (this layer is cached until pom.xml changes)
RUN mvn dependency:go-offline -q

# Copy the full source tree
COPY backend/src ./src

# Package the application, skipping tests (tests run in CI, not here)
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

# Security: run as a non-root user
RUN groupadd --system spring && useradd --system --gid spring spring

WORKDIR /app

# Copy ONLY the executable JAR from the build stage
# Spring Boot Maven plugin produces church-backend-1.0.0.jar
COPY --from=builder /build/target/church-backend-1.0.0.jar app.jar

# Fix ownership
RUN chown spring:spring app.jar

USER spring

# Container / production profile. application-render.yml (committed,
# no secrets) is the only config baked into the image; the local
# application.yml — which holds real dev secrets — is excluded by the
# root .dockerignore. Render injects PORT at runtime; Spring reads it
# through server.port: ${PORT:8080} in application-render.yml.
ENV SPRING_PROFILES_ACTIVE=render

EXPOSE 8080

# ─── JVM tuning for a container environment ───────────────────
# -XX:+UseContainerSupport   — respect container CPU/memory limits
# -XX:MaxRAMPercentage=75.0  — use up to 75% of the container RAM
# -Djava.security.egd        — faster SecureRandom startup (JWT)
# -Dserver.address=0.0.0.0   — bind to all interfaces (required by Render)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dserver.address=0.0.0.0", \
  "-jar", "app.jar"]
