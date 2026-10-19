package com.gdm.church.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter using a fixed-window per-IP counter.
 *
 * NOTE: Counters reset on application restart and are NOT shared across
 * multiple backend instances. For multi-instance deployments a shared store
 * (e.g. Redis) should be used instead.
 *
 * Set {@code app.rate-limit.enabled=false} to disable (useful in tests).
 *
 * Limits enforced:
 *  POST /api/v1/auth/login          → 10 per IP per minute  (brute-force)
 *  POST /api/v1/contact-messages    → 5  per IP per minute
 *  POST /api/v1/prayer-requests     → 5  per IP per minute
 *  POST /api/v1/offerings           → 5  per IP per minute
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private record Limit(int max, long windowMs) {}

    private static final Map<String, Limit> LIMITS = Map.of(
        "POST:/api/v1/auth/login",        new Limit(10, 60_000L),
        "POST:/api/v1/contact-messages",  new Limit(5,  60_000L),
        "POST:/api/v1/prayer-requests",   new Limit(5,  60_000L),
        "POST:/api/v1/offerings",         new Limit(5,  60_000L)
    );

    /** key → [windowStartMs, count] */
    private final ConcurrentHashMap<String, long[]> counters = new ConcurrentHashMap<>();

    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest  request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain         chain)
            throws ServletException, IOException {

        if (!enabled) {
            chain.doFilter(request, response);
            return;
        }

        String key   = request.getMethod() + ":" + request.getRequestURI();
        Limit  limit = LIMITS.get(key);

        if (limit != null) {
            String ip         = clientIp(request);
            String counterKey = key + "@" + ip;

            if (isRateLimited(counterKey, limit)) {
                log.warn("Rate limit exceeded: {} from {}", key, ip);
                send429(response);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean isRateLimited(String counterKey, Limit limit) {
        long now = System.currentTimeMillis();

        long[] state = counters.compute(counterKey, (k, existing) -> {
            if (existing == null || now - existing[0] >= limit.windowMs()) {
                return new long[]{now, 1L};
            }
            existing[1]++;
            return existing;
        });

        return state[1] > limit.max();
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void send429(HttpServletResponse response) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(429);
        mapper.writeValue(response.getOutputStream(), Map.of(
            "timestamp", Instant.now().toString(),
            "status",    429,
            "code",      "TOO_MANY_REQUESTS",
            "message",   "Too many requests. Please wait a moment and try again."
        ));
    }
}
