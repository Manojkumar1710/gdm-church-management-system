package com.gdm.church.sundayschool.children;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildRepository extends JpaRepository<SundaySchoolChild, Long> {
    Page<SundaySchoolChild> findAllByOrderByNameAsc(Pageable pageable);
    Page<SundaySchoolChild> findByActiveTrueOrderByNameAsc(Pageable pageable);
}
