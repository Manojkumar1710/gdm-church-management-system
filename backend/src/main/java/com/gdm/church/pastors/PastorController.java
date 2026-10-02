package com.gdm.church.pastors;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PastorController {

    private final PastorService pastorService;

    // ---- Public Pastors ----
    @GetMapping("/pastors")
    public ResponseEntity<ApiResponse<List<PastorDto>>> publicPastors() {
        return ResponseEntity.ok(ApiResponse.success(pastorService.getActivePastors()));
    }

    // ---- Public Schedule ----
    @GetMapping("/pastor-schedule")
    public ResponseEntity<ApiResponse<List<PastorScheduleDto>>> publicSchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(pastorService.getUpcomingSchedule(from, to)));
    }

    // ---- Admin Pastors ----
    @GetMapping("/admin/pastors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PastorDto>>> adminList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(pastorService.adminListPastors(page, size)));
    }

    @GetMapping("/admin/pastors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PastorDto>> getPastor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(pastorService.getPastor(id)));
    }

    @PostMapping("/admin/pastors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PastorDto>> create(@Valid @RequestBody PastorDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Pastor created", pastorService.createPastor(dto)));
    }

    @PutMapping("/admin/pastors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PastorDto>> update(@PathVariable Long id, @Valid @RequestBody PastorDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Pastor updated", pastorService.updatePastor(id, dto)));
    }

    @PostMapping("/admin/pastors/{id}/photo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PastorDto>> uploadPhoto(@PathVariable Long id,
                                                               @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded", pastorService.uploadPastorPhoto(id, file)));
    }

    @GetMapping("/admin/pastors/{id}/schedules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PastorScheduleDto>>> getPastorSchedules(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(pastorService.getSchedulesForPastor(id)));
    }

    @DeleteMapping("/admin/pastors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        pastorService.deletePastor(id);
        return ResponseEntity.ok(ApiResponse.success("Pastor deleted"));
    }

    // ---- Admin Schedule ----
    @PostMapping("/admin/pastor-schedule")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PastorScheduleDto>> createSchedule(@Valid @RequestBody PastorScheduleDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Schedule created", pastorService.createSchedule(dto)));
    }

    @PutMapping("/admin/pastor-schedule/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PastorScheduleDto>> updateSchedule(@PathVariable Long id,
                                                                           @RequestBody PastorScheduleDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Schedule updated", pastorService.updateSchedule(id, dto)));
    }

    @DeleteMapping("/admin/pastor-schedule/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        pastorService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted"));
    }
}
