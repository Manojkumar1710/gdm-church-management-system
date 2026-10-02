package com.gdm.church.sermons;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SermonController {

    private final SermonService sermonService;

    @GetMapping("/sermons")
    public ResponseEntity<ApiResponse<PageResponse<SermonDto>>> publicList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(sermonService.getPublishedSermons(page, size)));
    }

    @GetMapping("/sermons/{id}")
    public ResponseEntity<ApiResponse<SermonDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(sermonService.getSermon(id)));
    }

    @GetMapping("/admin/sermons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<SermonDto>>> adminList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(sermonService.adminList(page, size)));
    }

    @PostMapping("/admin/sermons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SermonDto>> create(@Valid @RequestBody SermonDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Sermon created", sermonService.create(dto)));
    }

    @PutMapping("/admin/sermons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SermonDto>> update(@PathVariable Long id, @Valid @RequestBody SermonDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Sermon updated", sermonService.update(id, dto)));
    }

    @PostMapping("/admin/sermons/{id}/thumbnail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SermonDto>> uploadThumbnail(@PathVariable Long id,
                                                                    @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Thumbnail uploaded", sermonService.uploadThumbnail(id, file)));
    }

    @DeleteMapping("/admin/sermons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        sermonService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Sermon deleted"));
    }
}
