package com.gdm.church.church;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChurchRepository extends JpaRepository<ChurchInformation, Long> {
}
