package com.gdm.church.eventphotos;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import com.gdm.church.config.CloudinaryService;
import com.gdm.church.events.Event;
import com.gdm.church.events.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventPhotoService {

    private final EventPhotoRepository photoRepository;
    private final EventRepository eventRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<EventPhotoDto> getLatestPhotos(int limit) {
        Page<EventPhoto> page = photoRepository.findByPublishedTrueOrderByCreatedAtDesc(
                PageRequest.of(0, Math.max(limit, 1)));
        return page.getContent().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<EventPhotoDto> getPhotosForEvent(Long eventId) {
        return photoRepository.findByEventIdAndPublishedTrueOrderByCreatedAtDesc(eventId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<EventPhotoDto> adminListPhotos(Long eventId, int page, int size) {
        Page<EventPhoto> result = eventId != null
                ? photoRepository.findByEventIdOrderByCreatedAtDesc(eventId, PageRequest.of(page, size))
                : photoRepository.findByPublishedTrueOrderByCreatedAtDesc(PageRequest.of(page, size));
        return new PageResponse<>(result.map(this::toDto));
    }

    @Transactional
    public List<EventPhotoDto> uploadPhotos(Long eventId, List<MultipartFile> files,
                                            String title, String description, String location) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Event"));

        List<EventPhotoDto> results = new ArrayList<>();
        for (MultipartFile file : files) {
            String url = cloudinaryService.uploadImage(file, "event-photos");
            EventPhoto photo = EventPhoto.builder()
                    .event(event)
                    .imageUrl(url)
                    .title(title)
                    .description(description)
                    .location(location)
                    .published(true)
                    .build();
            results.add(toDto(photoRepository.save(photo)));
        }
        return results;
    }

    @Transactional
    public EventPhotoDto updatePhoto(Long id, EventPhotoDto dto) {
        EventPhoto photo = photoRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Event photo"));
        if (dto.getTitle() != null) photo.setTitle(dto.getTitle());
        if (dto.getDescription() != null) photo.setDescription(dto.getDescription());
        if (dto.getLocation() != null) photo.setLocation(dto.getLocation());
        if (dto.getPhotoDate() != null) photo.setPhotoDate(dto.getPhotoDate());
        photo.setPublished(dto.isPublished());
        return toDto(photoRepository.save(photo));
    }

    @Transactional
    public void deletePhoto(Long id) {
        photoRepository.deleteById(id);
    }

    private EventPhotoDto toDto(EventPhoto p) {
        return EventPhotoDto.builder()
                .id(p.getId())
                .eventId(p.getEvent() != null ? p.getEvent().getId() : null)
                .eventTitle(p.getEvent() != null ? p.getEvent().getTitle() : null)
                .title(p.getTitle())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .photoDate(p.getPhotoDate())
                .location(p.getLocation())
                .published(p.isPublished())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
