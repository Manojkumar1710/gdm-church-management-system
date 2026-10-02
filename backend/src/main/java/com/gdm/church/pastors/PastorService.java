package com.gdm.church.pastors;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import com.gdm.church.config.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PastorService {

    private final PastorRepository pastorRepository;
    private final PastorScheduleRepository scheduleRepository;
    private final CloudinaryService cloudinaryService;

    // ---- Public Pastors ----

    @Transactional(readOnly = true)
    public List<PastorDto> getActivePastors() {
        return pastorRepository.findByActiveTrueOrderByNameAsc()
                .stream().map(p -> toPublicDto(p)).toList();
    }

    // ---- Admin Pastors ----

    @Transactional(readOnly = true)
    public PageResponse<PastorDto> adminListPastors(int page, int size) {
        return new PageResponse<>(
                pastorRepository.findAllByOrderByNameAsc(PageRequest.of(page, size))
                        .map(this::toAdminDto));
    }

    @Transactional(readOnly = true)
    public PastorDto getPastor(Long id) {
        return toAdminDto(pastorRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pastor")));
    }

    @Transactional
    public PastorDto createPastor(PastorDto dto) {
        Pastor pastor = new Pastor();
        applyDto(pastor, dto);
        return toAdminDto(pastorRepository.save(pastor));
    }

    @Transactional
    public PastorDto updatePastor(Long id, PastorDto dto) {
        Pastor pastor = pastorRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pastor"));
        applyDto(pastor, dto);
        return toAdminDto(pastorRepository.save(pastor));
    }

    @Transactional
    public PastorDto uploadPastorPhoto(Long id, MultipartFile file) {
        Pastor pastor = pastorRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pastor"));
        String url = cloudinaryService.uploadImage(file, "pastors");
        pastor.setPhotoUrl(url);
        return toAdminDto(pastorRepository.save(pastor));
    }

    @Transactional
    public void deletePastor(Long id) {
        // Delete all schedule entries for this pastor first to satisfy the FK constraint,
        // then delete the pastor.
        scheduleRepository.deleteByPastorId(id);
        pastorRepository.deleteById(id);
    }

    // ---- Admin: fetch schedules for a specific pastor ----

    @Transactional(readOnly = true)
    public List<PastorScheduleDto> getSchedulesForPastor(Long pastorId) {
        return scheduleRepository.findByPastorIdOrderByServiceDateAsc(pastorId)
                .stream().map(this::toScheduleDto).toList();
    }

    // ---- Public Schedule ----

    @Transactional(readOnly = true)
    public List<PastorScheduleDto> getUpcomingSchedule(LocalDate from, LocalDate to) {
        List<PastorSchedule> schedules = (from != null && to != null)
                ? scheduleRepository.findByServiceDateBetweenOrderByServiceDateAsc(from, to)
                : scheduleRepository.findByServiceDateGreaterThanEqualOrderByServiceDateAsc(
                        from != null ? from : LocalDate.now());
        return schedules.stream().map(this::toScheduleDto).toList();
    }

    // ---- Admin Schedule ----

    @Transactional
    public PastorScheduleDto createSchedule(PastorScheduleDto dto) {
        Pastor pastor = pastorRepository.findById(dto.getPastorId())
                .orElseThrow(() -> ApiException.notFound("Pastor"));
        if (scheduleRepository.existsByPastorIdAndServiceDate(dto.getPastorId(), dto.getServiceDate())) {
            throw ApiException.conflict("This pastor already has a schedule on " + dto.getServiceDate());
        }
        PastorSchedule schedule = PastorSchedule.builder()
                .pastor(pastor)
                .serviceDate(dto.getServiceDate())
                .serviceType(dto.getServiceType())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .notes(dto.getNotes())
                .build();
        return toScheduleDto(scheduleRepository.save(schedule));
    }

    @Transactional
    public PastorScheduleDto updateSchedule(Long id, PastorScheduleDto dto) {
        PastorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Schedule"));
        if (dto.getPastorId() != null) {
            Pastor pastor = pastorRepository.findById(dto.getPastorId())
                    .orElseThrow(() -> ApiException.notFound("Pastor"));
            schedule.setPastor(pastor);
        }
        if (dto.getServiceDate() != null) schedule.setServiceDate(dto.getServiceDate());
        if (dto.getServiceType() != null) schedule.setServiceType(dto.getServiceType());
        if (dto.getStartTime() != null) schedule.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) schedule.setEndTime(dto.getEndTime());
        if (dto.getNotes() != null) schedule.setNotes(dto.getNotes());
        return toScheduleDto(scheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // Mapping
    // ----------------------------------------------------------------

    /** Public view — omits private contact if not flagged public */
    private PastorDto toPublicDto(Pastor p) {
        return PastorDto.builder()
                .id(p.getId())
                .name(p.getName())
                .village(p.getVillage())
                .contactNumber(p.isContactPublic() ? p.getContactNumber() : null)
                .email(null) // email never shown publicly
                .photoUrl(p.getPhotoUrl())
                .bio(p.getBio())
                .active(p.isActive())
                .contactPublic(p.isContactPublic())
                .build();
    }

    /** Admin view — all fields */
    private PastorDto toAdminDto(Pastor p) {
        return PastorDto.builder()
                .id(p.getId())
                .name(p.getName())
                .village(p.getVillage())
                .contactNumber(p.getContactNumber())
                .email(p.getEmail())
                .photoUrl(p.getPhotoUrl())
                .bio(p.getBio())
                .active(p.isActive())
                .contactPublic(p.isContactPublic())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private void applyDto(Pastor p, PastorDto dto) {
        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getVillage() != null) p.setVillage(dto.getVillage());
        if (dto.getContactNumber() != null) p.setContactNumber(dto.getContactNumber());
        if (dto.getEmail() != null) p.setEmail(dto.getEmail());
        if (dto.getPhotoUrl() != null) p.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getBio() != null) p.setBio(dto.getBio());
        p.setActive(dto.isActive());
        p.setContactPublic(dto.isContactPublic());
    }

    private PastorScheduleDto toScheduleDto(PastorSchedule s) {
        return PastorScheduleDto.builder()
                .id(s.getId())
                .pastorId(s.getPastor().getId())
                .pastorName(s.getPastor().getName())
                .pastorVillage(s.getPastor().getVillage())
                .serviceDate(s.getServiceDate())
                .serviceType(s.getServiceType())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .notes(s.getNotes())
                .build();
    }
}
