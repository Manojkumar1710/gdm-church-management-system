package com.gdm.church.sundayschool.children;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "sunday_school_children")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SundaySchoolChild extends BaseEntity {
    @Column(nullable = false, length = 150)
    private String name;
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    @Column(length = 150)
    private String village;
    @Column(name = "parent_name", length = 150)
    private String parentName;
    @Column(name = "parent_contact", length = 20)
    private String parentContact;
    @Column(name = "class_group", length = 100)
    private String classGroup;
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
