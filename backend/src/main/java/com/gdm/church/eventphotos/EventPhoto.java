package com.gdm.church.eventphotos;

import com.gdm.church.common.BaseEntity;
import com.gdm.church.events.Event;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "event_photos", indexes = {
        @Index(name = "idx_ep_event", columnList = "event_id"),
        @Index(name = "idx_ep_published", columnList = "published")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPhoto extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "photo_date")
    private LocalDate photoDate;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;
}
