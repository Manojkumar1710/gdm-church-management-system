package com.gdm.church.youtube;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YoutubeRepository extends JpaRepository<YoutubeVideo, Long> {
    Page<YoutubeVideo> findByPublishedTrueOrderByPublishedDateDesc(Pageable pageable);
    Page<YoutubeVideo> findAllByOrderByPublishedDateDesc(Pageable pageable);
}
