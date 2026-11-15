package com.gdm.church.songs;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "songs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Song extends BaseEntity {

    @Column(name = "song_number", unique = true)
    private Integer songNumber;

    @NotBlank(message = "Telugu title is required")
    @Size(max = 255, message = "Telugu title must not exceed 255 characters")
    @Column(name = "title_te", nullable = false)
    private String titleTe;

    @NotBlank(message = "English title is required")
    @Size(max = 255, message = "English title must not exceed 255 characters")
    @Column(name = "title_en", nullable = false)
    private String titleEn;

    @NotBlank(message = "Telugu lyrics are required")
    @Column(name = "lyrics_te", columnDefinition = "LONGTEXT", nullable = false)
    private String lyricsTe;

    @NotBlank(message = "English lyrics is required")
    @Column(name = "lyrics_en", columnDefinition = "LONGTEXT", nullable = false)
    private String lyricsEn;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    @Column(length = 100)
    @Builder.Default
    private String category = "General";
}
