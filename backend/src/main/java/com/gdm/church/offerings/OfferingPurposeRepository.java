package com.gdm.church.offerings;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OfferingPurposeRepository extends JpaRepository<OfferingPurpose, Long> {
    List<OfferingPurpose> findByActiveTrueOrderBySortOrderAsc();
}
