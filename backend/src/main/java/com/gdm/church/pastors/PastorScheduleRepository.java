package com.gdm.church.pastors;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PastorScheduleRepository extends JpaRepository<PastorSchedule, Long> {

    List<PastorSchedule> findByServiceDateBetweenOrderByServiceDateAsc(LocalDate from, LocalDate to);

    List<PastorSchedule> findByServiceDateGreaterThanEqualOrderByServiceDateAsc(LocalDate from);

    boolean existsByPastorIdAndServiceDate(Long pastorId, LocalDate serviceDate);

    void deleteByPastorId(Long pastorId);

    List<PastorSchedule> findByPastorIdOrderByServiceDateAsc(Long pastorId);
}
