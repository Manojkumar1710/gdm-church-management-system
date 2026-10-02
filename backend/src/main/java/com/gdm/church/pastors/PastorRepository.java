package com.gdm.church.pastors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PastorRepository extends JpaRepository<Pastor, Long> {
    List<Pastor> findByActiveTrueOrderByNameAsc();
    Page<Pastor> findAllByOrderByNameAsc(Pageable pageable);
}
