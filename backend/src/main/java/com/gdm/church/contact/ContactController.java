package com.gdm.church.contact;

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
public class ContactController {
    private final ContactService contactService;

    @PostMapping("/contact-messages")
    public ResponseEntity<ApiResponse<Void>> submit(@Valid @RequestBody ContactDto dto) {
        contactService.submit(dto);
        return ResponseEntity.ok(ApiResponse.success("Thank you for reaching out. We will be in touch soon."));
    }

    @GetMapping("/admin/contact-messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ContactDto>>> adminList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(contactService.adminList(page, size)));
    }

    @PatchMapping("/admin/contact-messages/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContactDto>> updateStatus(@PathVariable Long id,
                                                                 @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", contactService.updateStatus(id, body.get("status"))));
    }
}
