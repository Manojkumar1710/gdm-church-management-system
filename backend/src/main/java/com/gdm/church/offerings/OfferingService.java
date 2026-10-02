package com.gdm.church.offerings;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferingService {

    private final OfferingRepository offeringRepo;
    private final OfferingPurposeRepository purposeRepo;

    // ---- Public ----
    @Transactional(readOnly = true)
    public List<OfferingPurposeDto> getActivePurposes() {
        return purposeRepo.findByActiveTrueOrderBySortOrderAsc()
                .stream().map(p -> new OfferingPurposeDto(p.getId(), p.getName(), p.getDescription())).toList();
    }

    /**
     * Public offering submission — manual record.
     * NOTE: Online payment flow (Phase 13) builds on this.
     */
    @Transactional
    public OfferingDto submitOffering(OfferingDto dto) {
        OfferingPurpose purpose = dto.getPurposeId() != null
                ? purposeRepo.findById(dto.getPurposeId()).orElseThrow(() -> ApiException.notFound("Offering purpose"))
                : null;
        Offering o = Offering.builder()
                .donorName(dto.isAnonymous() ? "Anonymous" : dto.getDonorName())
                .email(dto.isAnonymous() ? null : dto.getEmail())
                .amount(dto.getAmount())
                .purpose(purpose)
                .offeringDate(dto.getOfferingDate() != null ? dto.getOfferingDate() : LocalDate.now())
                .paymentMethod(dto.getPaymentMethod())
                .paymentReference(dto.getPaymentReference())
                .status(Offering.OfferingStatus.PENDING)
                .anonymous(dto.isAnonymous())
                .notes(dto.getNotes())
                .build();
        return toDto(offeringRepo.save(o));
    }

    // ---- Admin ----
    @Transactional(readOnly = true)
    public PageResponse<OfferingDto> adminList(int page, int size) {
        return new PageResponse<>(offeringRepo.findAllByOrderByOfferingDateDesc(PageRequest.of(page, size))
                .map(this::toDto));
    }

    @Transactional
    public OfferingDto adminCreate(OfferingDto dto) {
        return submitOffering(dto);
    }

    @Transactional
    public OfferingDto updateStatus(Long id, String status) {
        Offering o = offeringRepo.findById(id).orElseThrow(() -> ApiException.notFound("Offering"));
        try { o.setStatus(Offering.OfferingStatus.valueOf(status.toUpperCase())); }
        catch (IllegalArgumentException e) { throw ApiException.badRequest("Invalid status: " + status); }
        return toDto(offeringRepo.save(o));
    }

    // ---- Purposes admin ----
    @Transactional
    public OfferingPurposeDto createPurpose(String name, String description, int sortOrder) {
        OfferingPurpose p = OfferingPurpose.builder().name(name).description(description)
                .sortOrder(sortOrder).active(true).build();
        p = purposeRepo.save(p);
        return new OfferingPurposeDto(p.getId(), p.getName(), p.getDescription());
    }

    @Transactional
    public void deletePurpose(Long id) { purposeRepo.deleteById(id); }

    // ---- Seed ----
    @Bean
    public CommandLineRunner seedOfferingPurposes() {
        return args -> {
            if (purposeRepo.count() == 0) {
                List<String> purposes = List.of(
                        "Family Prayer", "Church Construction", "Sunday School",
                        "Missions", "Church Maintenance", "General Offering", "Other");
                int order = 1;
                for (String name : purposes) {
                    purposeRepo.save(OfferingPurpose.builder().name(name).active(true).sortOrder(order++).build());
                }
            }
        };
    }

    private OfferingDto toDto(Offering o) {
        return OfferingDto.builder()
                .id(o.getId()).donorName(o.getDonorName()).email(o.getEmail())
                .amount(o.getAmount())
                .purposeId(o.getPurpose() != null ? o.getPurpose().getId() : null)
                .purposeName(o.getPurpose() != null ? o.getPurpose().getName() : null)
                .offeringDate(o.getOfferingDate()).paymentMethod(o.getPaymentMethod())
                .paymentReference(o.getPaymentReference()).status(o.getStatus().name())
                .anonymous(o.isAnonymous()).notes(o.getNotes()).createdAt(o.getCreatedAt())
                .build();
    }

    public record OfferingPurposeDto(Long id, String name, String description) {}
}
