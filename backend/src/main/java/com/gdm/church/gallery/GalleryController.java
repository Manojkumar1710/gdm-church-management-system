package com.gdm.church.gallery;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GalleryController {
    private final GalleryService galleryService;

    @GetMapping("/gallery")
    public ResponseEntity<ApiResponse<PageResponse<GalleryDto>>> publicList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.getPublished(page, size)));
    }

    @GetMapping("/admin/gallery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<GalleryDto>>> adminList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.adminList(page, size)));
    }

    @PostMapping("/admin/gallery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryDto>> create(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.success("Image added", galleryService.create(file, title, description, category)));
    }

    @PatchMapping("/admin/gallery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryDto>> update(@PathVariable Long id, @RequestBody GalleryDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Gallery item updated", galleryService.update(id, dto)));
    }

    @DeleteMapping("/admin/gallery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        galleryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Gallery item deleted"));
    }
}
