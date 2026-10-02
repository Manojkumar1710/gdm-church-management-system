package com.gdm.church.offerings;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "offerings", indexes = {
        @Index(name = "idx_offering_status", columnList = "status"),
        @Index(name = "idx_offering_date", columnList = "offering_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Offering extends BaseEntity {
    @Column(name = "donor_name", length = 150)
    private String donorName;
    @Column(length = 180)
    private String email;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purpose_id")
    private OfferingPurpose purpose;
    @Column(name = "offering_date", nullable = false)
    private LocalDate offeringDate;
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    @Column(name = "payment_reference", length = 200)
    private String paymentReference;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OfferingStatus status = OfferingStatus.PENDING;
    @Column(nullable = false)
    @Builder.Default
    private boolean anonymous = false;
    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum OfferingStatus { PENDING, SUCCESS, FAILED }
}
