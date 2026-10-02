package com.gdm.church.sundayschool.programs;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "sunday_school_programs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SundaySchoolProgram extends BaseEntity {
    @Column(nullable = false, length = 200)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "program_date")
    private LocalDate programDate;
    @Column(length = 200)
    private String location;
    @Column(name = "image_url", length = 1000)
    private String imageUrl;
    @Column(name = "video_url", length = 1000)
    private String videoUrl;
    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;
}
