package com.gdm.church.eventphotos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventPhotoRepository extends JpaRepository<EventPhoto, Long> {

    List<EventPhoto> findByEventIdAndPublishedTrueOrderByCreatedAtDesc(Long eventId);

    Page<EventPhoto> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<EventPhoto> findByEventIdOrderByCreatedAtDesc(Long eventId, Pageable pageable);
}
