package com.gdm.church.sermons;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SermonDto {
    private Long id;
    @NotBlank(message = "Sermon title is required")
    private String title;
    private String description;
    private String speaker;
    private LocalDate sermonDate;
    private String thumbnailUrl;
    private String videoUrl;
    private String audioUrl;
    private String duration;
    private boolean published;
    private Instant createdAt;
    private Instant updatedAt;
}
