package com.gdm.church.youtube;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class YoutubeController {

    private final YoutubeService youtubeService;

    @GetMapping("/youtube")
    public ResponseEntity<ApiResponse<PageResponse<YoutubeDto>>> publicList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(youtubeService.getPublished(page, size)));
    }

    @GetMapping("/admin/youtube")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<YoutubeDto>>> adminList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(youtubeService.adminList(page, size)));
    }

    @PostMapping("/admin/youtube")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<YoutubeDto>> create(@Valid @RequestBody YoutubeDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Video added", youtubeService.create(dto)));
    }

    @PutMapping("/admin/youtube/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<YoutubeDto>> update(@PathVariable Long id, @Valid @RequestBody YoutubeDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Video updated", youtubeService.update(id, dto)));
    }

    @DeleteMapping("/admin/youtube/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        youtubeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Video deleted"));
    }
}
