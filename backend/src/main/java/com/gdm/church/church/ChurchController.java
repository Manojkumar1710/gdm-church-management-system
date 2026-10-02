package com.gdm.church.church;

import com.gdm.church.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChurchController {

    private final ChurchService churchService;

    // ---- Public ----
    @GetMapping("/api/v1/church")
    public ResponseEntity<ApiResponse<ChurchDto>> getChurchInfo() {
        return ResponseEntity.ok(ApiResponse.success(churchService.getChurchInfo()));
    }

    @GetMapping("/api/v1/hero")
    public ResponseEntity<ApiResponse<HeroDto>> getActiveHero() {
        return ResponseEntity.ok(ApiResponse.success(churchService.getActiveHero()));
    }

    // ---- Admin ----
    @PutMapping("/api/v1/admin/church")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ChurchDto>> updateChurch(@Valid @RequestBody ChurchDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Church information updated", churchService.upsertChurchInfo(dto)));
    }

    @GetMapping("/api/v1/admin/heroes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HeroDto>>> listHeroes() {
        return ResponseEntity.ok(ApiResponse.success(churchService.getAllHeroes()));
    }

    @PostMapping("/api/v1/admin/heroes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeroDto>> createHero(@Valid @RequestBody HeroDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Hero created", churchService.createHero(dto)));
    }

    @PutMapping("/api/v1/admin/heroes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeroDto>> updateHero(@PathVariable Long id, @Valid @RequestBody HeroDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Hero updated", churchService.updateHero(id, dto)));
    }

    @PostMapping("/api/v1/admin/heroes/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeroDto>> uploadHeroImage(@PathVariable Long id,
                                                                 @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", churchService.uploadHeroImage(id, file)));
    }

    @DeleteMapping("/api/v1/admin/heroes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHero(@PathVariable Long id) {
        churchService.deleteHero(id);
        return ResponseEntity.ok(ApiResponse.success("Hero deleted"));
    }
}
