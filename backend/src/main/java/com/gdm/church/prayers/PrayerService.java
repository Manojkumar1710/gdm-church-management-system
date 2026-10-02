package com.gdm.church.prayers;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PrayerService {

    private final PrayerRepository repo;

    @Transactional
    public PrayerDto submit(PrayerDto dto) {
        PrayerRequest p = PrayerRequest.builder()
                .name(dto.isAnonymous() ? null : dto.getName())
                .email(dto.isAnonymous() ? null : dto.getEmail())
                .requestText(dto.getRequestText())
                .anonymous(dto.isAnonymous())
                .build();
        // Return minimal DTO — no note, no status detail needed
        PrayerRequest saved = repo.save(p);
        return PrayerDto.builder()
                .id(saved.getId())
                .anonymous(saved.isAnonymous())
                .status(saved.getStatus().name())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<PrayerDto> adminList(int page, int size) {
        return new PageResponse<>(
                repo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                        .map(this::toAdminDto));
    }

    @Transactional
    public PrayerDto updateStatus(Long id, String status, String pastoralNote) {
        PrayerRequest p = repo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Prayer request"));
        try {
            p.setStatus(PrayerRequest.PrayerStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid status: " + status);
        }
        if (pastoralNote != null && !pastoralNote.isBlank()) {
            p.setPastoralNote(pastoralNote.trim());
        }
        return toAdminDto(repo.save(p));
    }

    // ----------------------------------------------------------------
    private PrayerDto toAdminDto(PrayerRequest p) {
        return PrayerDto.builder()
                .id(p.getId())
                .name(p.getName())
                .email(p.getEmail())
                .requestText(p.getRequestText())
                .anonymous(p.isAnonymous())
                .status(p.getStatus().name())
                .pastoralNote(p.getPastoralNote())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
