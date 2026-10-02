package com.gdm.church.church;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "church_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChurchInformation extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 300)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String history;

    @Column(columnDefinition = "TEXT")
    private String vision;

    @Column(columnDefinition = "TEXT")
    private String mission;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 180)
    private String email;

    @Column(name = "map_url", length = 1000)
    private String mapUrl;
}
