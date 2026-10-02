package com.gdm.church.sundayschool.programs;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramRepository extends JpaRepository<SundaySchoolProgram, Long> {
    Page<SundaySchoolProgram> findByPublishedTrueOrderByProgramDateDesc(Pageable pageable);
    Page<SundaySchoolProgram> findAllByOrderByProgramDateDesc(Pageable pageable);
}
