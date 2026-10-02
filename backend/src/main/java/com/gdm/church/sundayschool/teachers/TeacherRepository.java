package com.gdm.church.sundayschool.teachers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeacherRepository extends JpaRepository<SundaySchoolTeacher, Long> {
    List<SundaySchoolTeacher> findByActiveTrueOrderByNameAsc();
    Page<SundaySchoolTeacher> findAllByOrderByNameAsc(Pageable pageable);
}
