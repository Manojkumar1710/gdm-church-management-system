package com.gdm.church.gallery;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GalleryRepository extends JpaRepository<GalleryItem, Long> {
    Page<GalleryItem> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<GalleryItem> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
