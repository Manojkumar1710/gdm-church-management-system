package com.gdm.church.church;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hero_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeroSection extends BaseEntity {

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 500)
    private String subtitle;

    @Column(name = "background_image_url", length = 1000)
    private String backgroundImageUrl;

    @Column(name = "primary_cta_text", length = 100)
    private String primaryCtaText;

    @Column(name = "primary_cta_url", length = 500)
    private String primaryCtaUrl;

    @Column(name = "secondary_cta_text", length = 100)
    private String secondaryCtaText;

    @Column(name = "secondary_cta_url", length = 500)
    private String secondaryCtaUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
