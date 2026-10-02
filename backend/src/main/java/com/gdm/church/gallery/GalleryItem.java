package com.gdm.church.gallery;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gallery")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GalleryItem extends BaseEntity {
    @Column(length = 200)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;
    @Column(length = 100)
    private String category;
    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;
}
