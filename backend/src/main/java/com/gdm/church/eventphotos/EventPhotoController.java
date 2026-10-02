package com.gdm.church.eventphotos;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EventPhotoController {

    private final EventPhotoService photoService;

    // ---- Public ----
    @GetMapping("/event-photos/latest")
    public ResponseEntity<ApiResponse<List<EventPhotoDto>>> latest(
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(ApiResponse.success(photoService.getLatestPhotos(limit)));
    }

    @GetMapping("/events/{eventId}/photos")
    public ResponseEntity<ApiResponse<List<EventPhotoDto>>> byEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success(photoService.getPhotosForEvent(eventId)));
    }

    // ---- Admin ----
    @GetMapping("/admin/event-photos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<EventPhotoDto>>> adminList(
            @RequestParam(required = false) Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(photoService.adminListPhotos(eventId, page, size)));
    }

    @PostMapping("/admin/events/{eventId}/photos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EventPhotoDto>>> upload(
            @PathVariable Long eventId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String location) {
        List<EventPhotoDto> uploaded = photoService.uploadPhotos(eventId, files, title, description, location);
        return ResponseEntity.ok(ApiResponse.success(uploaded.size() + " photo(s) uploaded", uploaded));
    }

    @PatchMapping("/admin/event-photos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventPhotoDto>> update(@PathVariable Long id,
                                                              @RequestBody EventPhotoDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Photo updated", photoService.updatePhoto(id, dto)));
    }

    @DeleteMapping("/admin/event-photos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        photoService.deletePhoto(id);
        return ResponseEntity.ok(ApiResponse.success("Photo deleted"));
    }
}
