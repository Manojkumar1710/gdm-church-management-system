package com.gdm.church.events;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // ---- Public ----
    @GetMapping("/events/upcoming")
    public ResponseEntity<ApiResponse<List<EventDto>>> upcoming() {
        return ResponseEntity.ok(ApiResponse.success(eventService.getUpcomingEvents()));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<PageResponse<EventDto>>> publicList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getAllPublicEvents(page, size)));
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<ApiResponse<EventDto>> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEvent(id)));
    }

    // ---- Admin ----
    @GetMapping("/admin/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<EventDto>>> adminList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(eventService.adminListEvents(page, size)));
    }

    @PostMapping("/admin/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventDto>> create(@Valid @RequestBody EventDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Event created", eventService.createEvent(dto)));
    }

    @PutMapping("/admin/events/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventDto>> update(@PathVariable Long id, @Valid @RequestBody EventDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Event updated", eventService.updateEvent(id, dto)));
    }

    @PostMapping("/admin/events/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventDto>> uploadImage(@PathVariable Long id,
                                                              @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", eventService.uploadEventImage(id, file)));
    }

    @DeleteMapping("/admin/events/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted"));
    }
}
