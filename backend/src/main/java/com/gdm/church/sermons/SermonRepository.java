package com.gdm.church.sermons;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SermonRepository extends JpaRepository<Sermon, Long> {
    Page<Sermon> findByPublishedTrueOrderBySermonDateDesc(Pageable pageable);
    Page<Sermon> findAllByOrderBySermonDateDesc(Pageable pageable);
}
