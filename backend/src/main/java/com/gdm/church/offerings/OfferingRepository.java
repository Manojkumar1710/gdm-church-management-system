package com.gdm.church.offerings;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferingRepository extends JpaRepository<Offering, Long> {
    Page<Offering> findAllByOrderByOfferingDateDesc(Pageable pageable);
    Page<Offering> findByStatusOrderByOfferingDateDesc(Offering.OfferingStatus status, Pageable pageable);
}
