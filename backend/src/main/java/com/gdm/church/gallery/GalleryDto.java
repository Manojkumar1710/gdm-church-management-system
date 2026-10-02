package com.gdm.church.gallery;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GalleryDto {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String category;
    private boolean published;
    private Instant createdAt;
}
