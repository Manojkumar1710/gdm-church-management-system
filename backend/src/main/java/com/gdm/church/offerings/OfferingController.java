package com.gdm.church.offerings;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OfferingController {

    private final OfferingService offeringService;

    // ---- Public ----
    @GetMapping("/offering-purposes")
    public ResponseEntity<ApiResponse<List<OfferingService.OfferingPurposeDto>>> purposes() {
        return ResponseEntity.ok(ApiResponse.success(offeringService.getActivePurposes()));
    }

    @PostMapping("/offerings")
    public ResponseEntity<ApiResponse<Void>> submit(@Valid @RequestBody OfferingDto dto) {
        offeringService.submitOffering(dto);
        return ResponseEntity.ok(ApiResponse.success("Your offering has been recorded. Thank you for your generosity."));
    }

    // ---- Admin Offerings ----
    @GetMapping("/admin/offerings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<OfferingDto>>> adminList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(offeringService.adminList(page, size)));
    }

    @PostMapping("/admin/offerings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfferingDto>> adminCreate(@Valid @RequestBody OfferingDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Offering recorded", offeringService.adminCreate(dto)));
    }

    @PatchMapping("/admin/offerings/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfferingDto>> updateStatus(@PathVariable Long id,
                                                                   @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", offeringService.updateStatus(id, body.get("status"))));
    }

    // ---- Admin Purposes ----
    @PostMapping("/admin/offering-purposes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfferingService.OfferingPurposeDto>> createPurpose(
            @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String description = (String) body.get("description");
        int sortOrder = body.containsKey("sortOrder") ? Integer.parseInt(body.get("sortOrder").toString()) : 0;
        return ResponseEntity.ok(ApiResponse.success("Purpose created",
                offeringService.createPurpose(name, description, sortOrder)));
    }

    @DeleteMapping("/admin/offering-purposes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePurpose(@PathVariable Long id) {
        offeringService.deletePurpose(id);
        return ResponseEntity.ok(ApiResponse.success("Purpose deleted"));
    }
}
