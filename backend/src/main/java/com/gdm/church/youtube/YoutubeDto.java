package com.gdm.church.youtube;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class YoutubeDto {
    private Long id;
    @NotBlank(message = "Title is required")
    private String title;
    private String description;

    @NotBlank(message = "YouTube URL is required")
    @Pattern(regexp = "^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be)/.+",
             message = "Must be a valid YouTube URL")
    private String youtubeUrl;

    private String thumbnailUrl;
    private String category;
    private LocalDate publishedDate;
    private boolean published;
    private Instant createdAt;
}
