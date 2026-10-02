package com.gdm.church.sermons;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "sermons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sermon extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 150)
    private String speaker;

    @Column(name = "sermon_date")
    private LocalDate sermonDate;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(name = "video_url", length = 1000)
    private String videoUrl;

    @Column(name = "audio_url", length = 1000)
    private String audioUrl;

    @Column(length = 20)
    private String duration;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = false;
}
