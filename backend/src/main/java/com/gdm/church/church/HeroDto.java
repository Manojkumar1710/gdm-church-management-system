package com.gdm.church.church;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HeroDto {
    private Long id;
    @NotBlank(message = "Title is required")
    private String title;
    private String subtitle;
    private String backgroundImageUrl;
    private String primaryCtaText;
    private String primaryCtaUrl;
    private String secondaryCtaText;
    private String secondaryCtaUrl;
    private boolean active;
}
