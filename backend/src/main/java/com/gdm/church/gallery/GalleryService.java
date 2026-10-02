package com.gdm.church.gallery;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import com.gdm.church.config.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class GalleryService {
    private final GalleryRepository repo;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public PageResponse<GalleryDto> getPublished(int page, int size) {
        return new PageResponse<>(repo.findByPublishedTrueOrderByCreatedAtDesc(PageRequest.of(page, size)).map(this::toDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<GalleryDto> adminList(int page, int size) {
        return new PageResponse<>(repo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size)).map(this::toDto));
    }

    @Transactional
    public GalleryDto create(MultipartFile file, String title, String description, String category) {
        String url = cloudinaryService.uploadImage(file, "gallery");
        GalleryItem item = GalleryItem.builder().imageUrl(url).title(title).description(description)
                .category(category).published(true).build();
        return toDto(repo.save(item));
    }

    @Transactional
    public GalleryDto update(Long id, GalleryDto dto) {
        GalleryItem item = repo.findById(id).orElseThrow(() -> ApiException.notFound("Gallery item"));
        if (dto.getTitle() != null) item.setTitle(dto.getTitle());
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        if (dto.getCategory() != null) item.setCategory(dto.getCategory());
        item.setPublished(dto.isPublished());
        return toDto(repo.save(item));
    }

    @Transactional
    public void delete(Long id) { repo.deleteById(id); }

    private GalleryDto toDto(GalleryItem g) {
        return GalleryDto.builder().id(g.getId()).title(g.getTitle()).description(g.getDescription())
                .imageUrl(g.getImageUrl()).category(g.getCategory()).published(g.isPublished())
                .createdAt(g.getCreatedAt()).build();
    }
}
