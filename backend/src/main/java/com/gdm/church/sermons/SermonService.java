package com.gdm.church.sermons;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import com.gdm.church.config.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SermonService {

    private final SermonRepository sermonRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public PageResponse<SermonDto> getPublishedSermons(int page, int size) {
        return new PageResponse<>(
                sermonRepository.findByPublishedTrueOrderBySermonDateDesc(PageRequest.of(page, size))
                        .map(this::toDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<SermonDto> adminList(int page, int size) {
        return new PageResponse<>(
                sermonRepository.findAllByOrderBySermonDateDesc(PageRequest.of(page, size)).map(this::toDto));
    }

    @Transactional(readOnly = true)
    public SermonDto getSermon(Long id) {
        return toDto(sermonRepository.findById(id).orElseThrow(() -> ApiException.notFound("Sermon")));
    }

    @Transactional
    public SermonDto create(SermonDto dto) {
        Sermon s = new Sermon();
        apply(s, dto);
        return toDto(sermonRepository.save(s));
    }

    @Transactional
    public SermonDto update(Long id, SermonDto dto) {
        Sermon s = sermonRepository.findById(id).orElseThrow(() -> ApiException.notFound("Sermon"));
        apply(s, dto);
        return toDto(sermonRepository.save(s));
    }

    @Transactional
    public SermonDto uploadThumbnail(Long id, MultipartFile file) {
        Sermon s = sermonRepository.findById(id).orElseThrow(() -> ApiException.notFound("Sermon"));
        s.setThumbnailUrl(cloudinaryService.uploadImage(file, "sermons"));
        return toDto(sermonRepository.save(s));
    }

    @Transactional
    public void delete(Long id) {
        sermonRepository.deleteById(id);
    }

    private SermonDto toDto(Sermon s) {
        return SermonDto.builder()
                .id(s.getId()).title(s.getTitle()).description(s.getDescription())
                .speaker(s.getSpeaker()).sermonDate(s.getSermonDate())
                .thumbnailUrl(s.getThumbnailUrl()).videoUrl(s.getVideoUrl())
                .audioUrl(s.getAudioUrl()).duration(s.getDuration())
                .published(s.isPublished()).createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt())
                .build();
    }

    private void apply(Sermon s, SermonDto dto) {
        if (dto.getTitle() != null) s.setTitle(dto.getTitle());
        if (dto.getDescription() != null) s.setDescription(dto.getDescription());
        if (dto.getSpeaker() != null) s.setSpeaker(dto.getSpeaker());
        if (dto.getSermonDate() != null) s.setSermonDate(dto.getSermonDate());
        if (dto.getThumbnailUrl() != null) s.setThumbnailUrl(dto.getThumbnailUrl());
        if (dto.getVideoUrl() != null) s.setVideoUrl(dto.getVideoUrl());
        if (dto.getAudioUrl() != null) s.setAudioUrl(dto.getAudioUrl());
        if (dto.getDuration() != null) s.setDuration(dto.getDuration());
        s.setPublished(dto.isPublished());
    }
}
