package com.gdm.church.contact;

import com.gdm.church.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_messages", indexes = @Index(name = "idx_contact_status", columnList = "status"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactMessage extends BaseEntity {
    @Column(nullable = false, length = 150)
    private String name;
    @Column(nullable = false, length = 180)
    private String email;
    @Column(length = 20)
    private String phone;
    @Column(length = 200)
    private String subject;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContactStatus status = ContactStatus.NEW;

    public enum ContactStatus { NEW, READ, RESOLVED }
}
