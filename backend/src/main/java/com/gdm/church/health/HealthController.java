package com.gdm.church.health;

import com.gdm.church.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lightweight public health-check endpoint for uptime monitoring
 * (e.g. UptimeRobot HEAD requests).  Does not query the database,
 * does not require authentication, and exposes no sensitive information.
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Void>> health() {
        return ResponseEntity.ok(ApiResponse.success("Application is running"));
    }
}
