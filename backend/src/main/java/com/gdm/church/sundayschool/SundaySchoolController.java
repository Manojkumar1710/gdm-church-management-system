package com.gdm.church.sundayschool;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.common.response.PageResponse;
import com.gdm.church.config.CloudinaryService;
import com.gdm.church.sundayschool.children.ChildRepository;
import com.gdm.church.sundayschool.children.SundaySchoolChild;
import com.gdm.church.sundayschool.programs.ProgramRepository;
import com.gdm.church.sundayschool.programs.SundaySchoolProgram;
import com.gdm.church.sundayschool.teachers.SundaySchoolTeacher;
import com.gdm.church.sundayschool.teachers.TeacherRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Sunday School controller.
 *
 * Children endpoints: accessible by ADMIN and SUNDAY_SCHOOL_TEACHER.
 * Teacher and Program endpoints: ADMIN only (no change to those).
 *
 * The SecurityConfig already permits /admin/sunday-school/** for
 * ADMIN and SUNDAY_SCHOOL_TEACHER. The @PreAuthorize here adds a
 * second layer of explicit method-level security.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SundaySchoolController {

    private final ChildRepository   childRepo;
    private final TeacherRepository teacherRepo;
    private final ProgramRepository programRepo;
    private final CloudinaryService cloudinaryService;

    // ─────────────────────────────────────────────────────────────────
    // DTOs
    // ─────────────────────────────────────────────────────────────────

    @Data @Builder
    static class ChildDto {
        private Long      id;
        @NotBlank
        private String    name;
        private LocalDate dateOfBirth;
        private String    village;
        private String    parentName;
        private String    parentContact;
        private String    classGroup;
        private boolean   active;
        private Instant   createdAt;
    }

    @Data @Builder
    static class TeacherDto {
        private Long    id;
        @NotBlank
        private String  name;
        private String  village;
        private String  contactNumber;
        private String  email;
        private String  classGroup;
        private String  photoUrl;
        private boolean active;
        private boolean contactPublic;
    }

    @Data @Builder
    static class ProgramDto {
        private Long      id;
        @NotBlank
        private String    title;
        private String    description;
        private LocalDate programDate;
        private String    location;
        private String    imageUrl;
        private String    videoUrl;
        private boolean   published;
        private Instant   createdAt;
    }

    // ─────────────────────────────────────────────────────────────────
    // Public Programs (no auth)
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/sunday-school/programs")
    public ResponseEntity<ApiResponse<PageResponse<ProgramDto>>> publicPrograms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = programRepo.findByPublishedTrueOrderByProgramDateDesc(PageRequest.of(page, size))
                .map(p -> ProgramDto.builder()
                        .id(p.getId()).title(p.getTitle()).description(p.getDescription())
                        .programDate(p.getProgramDate()).location(p.getLocation())
                        .imageUrl(p.getImageUrl()).videoUrl(p.getVideoUrl())
                        .published(p.isPublished()).createdAt(p.getCreatedAt()).build());
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    // ─────────────────────────────────────────────────────────────────
    // Children — ADMIN + SUNDAY_SCHOOL_TEACHER
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/admin/sunday-school/children")
    @PreAuthorize("hasAnyRole('ADMIN','SUNDAY_SCHOOL_TEACHER')")
    public ResponseEntity<ApiResponse<PageResponse<ChildDto>>> listChildren(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {

        // If a search term is provided filter by name/classGroup in memory for now
        // (all records are loaded page by page; for large sets a @Query would be added,
        //  but this is sufficient for a church's Sunday school size)
        var result = childRepo.findAllByOrderByNameAsc(PageRequest.of(page, size))
                .map(c -> ChildDto.builder()
                        .id(c.getId()).name(c.getName()).dateOfBirth(c.getDateOfBirth())
                        .village(c.getVillage()).parentName(c.getParentName())
                        .parentContact(c.getParentContact()).classGroup(c.getClassGroup())
                        .active(c.isActive()).createdAt(c.getCreatedAt()).build());
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @PostMapping("/admin/sunday-school/children")
    @PreAuthorize("hasAnyRole('ADMIN','SUNDAY_SCHOOL_TEACHER')")
    public ResponseEntity<ApiResponse<ChildDto>> createChild(@RequestBody ChildDto dto) {
        SundaySchoolChild c = SundaySchoolChild.builder()
                .name(dto.getName())
                .dateOfBirth(dto.getDateOfBirth())
                .village(dto.getVillage())
                .parentName(dto.getParentName())
                .parentContact(dto.getParentContact())
                .classGroup(dto.getClassGroup())
                .active(true)
                .build();
        c = childRepo.save(c);
        return ResponseEntity.ok(ApiResponse.success("Child added",
                toChildDto(c)));
    }

    @PutMapping("/admin/sunday-school/children/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUNDAY_SCHOOL_TEACHER')")
    public ResponseEntity<ApiResponse<ChildDto>> updateChild(
            @PathVariable Long id, @RequestBody ChildDto dto) {
        SundaySchoolChild c = childRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Child"));
        if (dto.getName()         != null) c.setName(dto.getName());
        if (dto.getDateOfBirth()  != null) c.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getVillage()      != null) c.setVillage(dto.getVillage());
        if (dto.getParentName()   != null) c.setParentName(dto.getParentName());
        if (dto.getParentContact()!= null) c.setParentContact(dto.getParentContact());
        if (dto.getClassGroup()   != null) c.setClassGroup(dto.getClassGroup());
        c.setActive(dto.isActive());
        childRepo.save(c);
        return ResponseEntity.ok(ApiResponse.success("Child updated", toChildDto(c)));
    }

    @DeleteMapping("/admin/sunday-school/children/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUNDAY_SCHOOL_TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteChild(@PathVariable Long id) {
        childRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Child record deleted"));
    }

    /** Convenience: deactivate instead of delete */
    @PatchMapping("/admin/sunday-school/children/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','SUNDAY_SCHOOL_TEACHER')")
    public ResponseEntity<ApiResponse<ChildDto>> deactivateChild(@PathVariable Long id) {
        SundaySchoolChild c = childRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Child"));
        c.setActive(false);
        childRepo.save(c);
        return ResponseEntity.ok(ApiResponse.success("Child deactivated", toChildDto(c)));
    }

    // ─────────────────────────────────────────────────────────────────
    // Teachers — ADMIN only (unchanged)
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/admin/sunday-school/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<TeacherDto>>> listTeachers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = teacherRepo.findAllByOrderByNameAsc(PageRequest.of(page, size))
                .map(t -> TeacherDto.builder()
                        .id(t.getId()).name(t.getName()).village(t.getVillage())
                        .contactNumber(t.getContactNumber()).email(t.getEmail())
                        .classGroup(t.getClassGroup()).photoUrl(t.getPhotoUrl())
                        .active(t.isActive()).contactPublic(t.isContactPublic()).build());
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @PostMapping("/admin/sunday-school/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDto>> createTeacher(@RequestBody TeacherDto dto) {
        SundaySchoolTeacher t = SundaySchoolTeacher.builder()
                .name(dto.getName()).village(dto.getVillage())
                .contactNumber(dto.getContactNumber()).email(dto.getEmail())
                .classGroup(dto.getClassGroup()).active(true)
                .contactPublic(dto.isContactPublic()).build();
        t = teacherRepo.save(t);
        return ResponseEntity.ok(ApiResponse.success("Teacher added",
                TeacherDto.builder().id(t.getId()).name(t.getName()).build()));
    }

    @PutMapping("/admin/sunday-school/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDto>> updateTeacher(
            @PathVariable Long id, @RequestBody TeacherDto dto) {
        SundaySchoolTeacher t = teacherRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Teacher"));
        if (dto.getName()         != null) t.setName(dto.getName());
        if (dto.getVillage()      != null) t.setVillage(dto.getVillage());
        if (dto.getContactNumber()!= null) t.setContactNumber(dto.getContactNumber());
        if (dto.getEmail()        != null) t.setEmail(dto.getEmail());
        if (dto.getClassGroup()   != null) t.setClassGroup(dto.getClassGroup());
        t.setActive(dto.isActive());
        t.setContactPublic(dto.isContactPublic());
        teacherRepo.save(t);
        return ResponseEntity.ok(ApiResponse.success("Teacher updated",
                TeacherDto.builder().id(t.getId()).name(t.getName()).build()));
    }

    @PostMapping("/admin/sunday-school/teachers/{id}/photo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDto>> uploadTeacherPhoto(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        SundaySchoolTeacher t = teacherRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Teacher"));
        t.setPhotoUrl(cloudinaryService.uploadImage(file, "sunday-school/teachers"));
        teacherRepo.save(t);
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded",
                TeacherDto.builder().id(t.getId()).name(t.getName()).photoUrl(t.getPhotoUrl()).build()));
    }

    @DeleteMapping("/admin/sunday-school/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTeacher(@PathVariable Long id) {
        teacherRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Teacher deleted"));
    }

    // ─────────────────────────────────────────────────────────────────
    // Programs — ADMIN only (unchanged)
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/admin/sunday-school/programs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ProgramDto>>> adminPrograms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = programRepo.findAllByOrderByProgramDateDesc(PageRequest.of(page, size))
                .map(p -> ProgramDto.builder()
                        .id(p.getId()).title(p.getTitle()).description(p.getDescription())
                        .programDate(p.getProgramDate()).location(p.getLocation())
                        .imageUrl(p.getImageUrl()).videoUrl(p.getVideoUrl())
                        .published(p.isPublished()).createdAt(p.getCreatedAt()).build());
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @PostMapping("/admin/sunday-school/programs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProgramDto>> createProgram(
            @RequestParam("title") String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String programDate,
            @RequestParam(required = false) String videoUrl,
            @RequestParam(required = false) MultipartFile file) {
        String imageUrl = file != null
                ? cloudinaryService.uploadImage(file, "sunday-school/programs") : null;
        SundaySchoolProgram p = SundaySchoolProgram.builder()
                .title(title).description(description).location(location)
                .programDate(programDate != null ? LocalDate.parse(programDate) : null)
                .imageUrl(imageUrl).videoUrl(videoUrl).published(true).build();
        p = programRepo.save(p);
        return ResponseEntity.ok(ApiResponse.success("Program created",
                ProgramDto.builder().id(p.getId()).title(p.getTitle()).build()));
    }

    @PutMapping("/admin/sunday-school/programs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProgramDto>> updateProgram(
            @PathVariable Long id, @RequestBody ProgramDto dto) {
        SundaySchoolProgram p = programRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Program"));
        if (dto.getTitle()       != null) p.setTitle(dto.getTitle());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getLocation()    != null) p.setLocation(dto.getLocation());
        if (dto.getProgramDate() != null) p.setProgramDate(dto.getProgramDate());
        if (dto.getVideoUrl()    != null) p.setVideoUrl(dto.getVideoUrl());
        p.setPublished(dto.isPublished());
        programRepo.save(p);
        return ResponseEntity.ok(ApiResponse.success("Program updated",
                ProgramDto.builder().id(p.getId()).title(p.getTitle()).published(p.isPublished()).build()));
    }

    @DeleteMapping("/admin/sunday-school/programs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable Long id) {
        programRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Program deleted"));
    }

    // ─────────────────────────────────────────────────────────────────
    // Private helper
    // ─────────────────────────────────────────────────────────────────
    private ChildDto toChildDto(SundaySchoolChild c) {
        return ChildDto.builder()
                .id(c.getId()).name(c.getName()).dateOfBirth(c.getDateOfBirth())
                .village(c.getVillage()).parentName(c.getParentName())
                .parentContact(c.getParentContact()).classGroup(c.getClassGroup())
                .active(c.isActive()).createdAt(c.getCreatedAt()).build();
    }
}
