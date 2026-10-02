package com.gdm.church.youtube;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "youtube_videos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YoutubeVideo extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "youtube_url", nullable = false, length = 1000)
    private String youtubeUrl;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(length = 100)
    private String category;

    @Column(name = "published_date")
    private LocalDate publishedDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;
}
