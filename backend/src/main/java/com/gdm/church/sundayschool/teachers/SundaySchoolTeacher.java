package com.gdm.church.sundayschool.teachers;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sunday_school_teachers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SundaySchoolTeacher extends BaseEntity {
    @Column(nullable = false, length = 150)
    private String name;
    @Column(length = 150)
    private String village;
    @Column(name = "contact_number", length = 20)
    private String contactNumber;
    @Column(length = 180)
    private String email;
    @Column(name = "class_group", length = 100)
    private String classGroup;
    @Column(name = "photo_url", length = 1000)
    private String photoUrl;
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
    @Column(name = "contact_public", nullable = false)
    @Builder.Default
    private boolean contactPublic = false;
}
