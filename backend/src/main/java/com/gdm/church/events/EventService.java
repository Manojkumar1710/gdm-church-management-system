package com.gdm.church.events;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import com.gdm.church.config.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<EventDto> getUpcomingEvents() {
        return eventRepository
                .findByStatusAndEventDateGreaterThanEqualOrderByEventDateAsc(
                        Event.EventStatus.UPCOMING, LocalDate.now())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<EventDto> getAllPublicEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").descending());
        Page<EventDto> mapped = eventRepository
                .findByStatusNotOrderByEventDateAsc(Event.EventStatus.DRAFT, pageable)
                .map(this::toDto);
        return new PageResponse<>(mapped);
    }

    @Transactional(readOnly = true)
    public EventDto getEvent(Long id) {
        return eventRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> ApiException.notFound("Event"));
    }

    // Admin
    @Transactional(readOnly = true)
    public PageResponse<EventDto> adminListEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").descending());
        return new PageResponse<>(eventRepository.findAllByOrderByEventDateDesc(pageable).map(this::toDto));
    }

    @Transactional
    public EventDto createEvent(EventDto dto) {
        Event event = new Event();
        applyDto(event, dto);
        return toDto(eventRepository.save(event));
    }

    @Transactional
    public EventDto updateEvent(Long id, EventDto dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Event"));
        applyDto(event, dto);
        return toDto(eventRepository.save(event));
    }

    @Transactional
    public EventDto uploadEventImage(Long id, MultipartFile file) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Event"));
        String url = cloudinaryService.uploadImage(file, "events");
        event.setImageUrl(url);
        return toDto(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // Mapping
    // ----------------------------------------------------------------

    private EventDto toDto(Event e) {
        return EventDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventDate(e.getEventDate())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .location(e.getLocation())
                .imageUrl(e.getImageUrl())
                .registrationRequired(e.isRegistrationRequired())
                .capacity(e.getCapacity())
                .status(e.getStatus().name())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private void applyDto(Event e, EventDto dto) {
        if (dto.getTitle() != null) e.setTitle(dto.getTitle());
        if (dto.getDescription() != null) e.setDescription(dto.getDescription());
        if (dto.getEventDate() != null) e.setEventDate(dto.getEventDate());
        if (dto.getStartTime() != null) e.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) e.setEndTime(dto.getEndTime());
        if (dto.getLocation() != null) e.setLocation(dto.getLocation());
        if (dto.getImageUrl() != null) e.setImageUrl(dto.getImageUrl());
        e.setRegistrationRequired(dto.isRegistrationRequired());
        if (dto.getCapacity() != null) e.setCapacity(dto.getCapacity());
        if (dto.getStatus() != null) {
            try {
                e.setStatus(Event.EventStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw ApiException.badRequest("Invalid event status: " + dto.getStatus());
            }
        }
    }
}
