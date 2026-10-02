package com.gdm.church.church;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HeroRepository extends JpaRepository<HeroSection, Long> {
    Optional<HeroSection> findFirstByActiveTrue();
}
