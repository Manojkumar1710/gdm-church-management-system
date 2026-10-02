package com.gdm.church.prayers;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PrayerController {

    private final PrayerService prayerService;

    @PostMapping("/prayer-requests")
    public ResponseEntity<ApiResponse<Void>> submit(@Valid @RequestBody PrayerDto dto) {
        prayerService.submit(dto);
        return ResponseEntity.ok(ApiResponse.success(
                "Your prayer request has been received. We are praying for you. 🙏"));
    }

    @GetMapping("/admin/prayer-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PrayerDto>>> adminList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(prayerService.adminList(page, size)));
    }

    @PatchMapping("/admin/prayer-requests/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PrayerDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status      = body.getOrDefault("status", "");
        String pastoralNote = body.getOrDefault("note", "");
        return ResponseEntity.ok(ApiResponse.success(
                "Status updated", prayerService.updateStatus(id, status, pastoralNote)));
    }
}
