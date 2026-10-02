package com.gdm.church.offerings;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "offering_purposes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OfferingPurpose extends BaseEntity {
    @Column(nullable = false, length = 150)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
    @Column(name = "sort_order")
    @Builder.Default
    private int sortOrder = 0;
}
