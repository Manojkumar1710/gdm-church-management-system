package com.gdm.church.eventphotos;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventPhotoDto {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String title;
    private String description;
    private String imageUrl;
    private LocalDate photoDate;
    private String location;
    private boolean published;
    private Instant createdAt;
}
