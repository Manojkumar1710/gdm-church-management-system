package com.gdm.church.events;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    Page<Event> findByStatusNotOrderByEventDateAsc(Event.EventStatus status, Pageable pageable);

    List<Event> findByStatusAndEventDateGreaterThanEqualOrderByEventDateAsc(
            Event.EventStatus status, LocalDate from);

    Page<Event> findByStatusOrderByEventDateDesc(Event.EventStatus status, Pageable pageable);

    Page<Event> findAllByOrderByEventDateDesc(Pageable pageable);
}
