package com.gdm.church.prayers;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prayer_requests", indexes = @Index(name = "idx_prayer_status", columnList = "status"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrayerRequest extends BaseEntity {

    @Column(length = 150)
    private String name;

    @Column(length = 180)
    private String email;

    @Column(name = "request_text", nullable = false, columnDefinition = "TEXT")
    private String requestText;

    @Column(nullable = false)
    @Builder.Default
    private boolean anonymous = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PrayerStatus status = PrayerStatus.NEW;

    /** Optional pastoral note added when marking as PRAYED — stored privately, never shown publicly. */
    @Column(name = "pastoral_note", columnDefinition = "TEXT")
    private String pastoralNote;

    public enum PrayerStatus { NEW, IN_PROGRESS, PRAYED, ARCHIVED }
}
