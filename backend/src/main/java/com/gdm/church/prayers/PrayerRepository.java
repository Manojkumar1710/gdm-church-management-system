package com.gdm.church.prayers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrayerRepository extends JpaRepository<PrayerRequest, Long> {
    Page<PrayerRequest> findByStatusOrderByCreatedAtDesc(PrayerRequest.PrayerStatus status, Pageable pageable);
    Page<PrayerRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
