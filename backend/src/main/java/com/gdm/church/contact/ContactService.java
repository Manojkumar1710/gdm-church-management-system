package com.gdm.church.contact;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContactService {
    private final ContactRepository repo;

    @Transactional
    public void submit(ContactDto dto) {
        repo.save(ContactMessage.builder().name(dto.getName()).email(dto.getEmail())
                .phone(dto.getPhone()).subject(dto.getSubject()).message(dto.getMessage()).build());
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactDto> adminList(int page, int size) {
        return new PageResponse<>(repo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size)).map(this::toDto));
    }

    @Transactional
    public ContactDto updateStatus(Long id, String status) {
        ContactMessage m = repo.findById(id).orElseThrow(() -> ApiException.notFound("Contact message"));
        try { m.setStatus(ContactMessage.ContactStatus.valueOf(status.toUpperCase())); }
        catch (IllegalArgumentException e) { throw ApiException.badRequest("Invalid status: " + status); }
        return toDto(repo.save(m));
    }

    private ContactDto toDto(ContactMessage m) {
        return ContactDto.builder().id(m.getId()).name(m.getName()).email(m.getEmail())
                .phone(m.getPhone()).subject(m.getSubject()).message(m.getMessage())
                .status(m.getStatus().name()).createdAt(m.getCreatedAt()).build();
    }
}
