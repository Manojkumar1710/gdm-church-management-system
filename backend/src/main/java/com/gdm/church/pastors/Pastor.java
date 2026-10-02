package com.gdm.church.pastors;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pastors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pastor extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String village;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(length = 180)
    private String email;

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * Whether the contact number should be visible on the public website.
     */
    @Column(name = "contact_public", nullable = false)
    @Builder.Default
    private boolean contactPublic = false;
}
