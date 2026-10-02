package com.gdm.church;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GdmChurchApplication {

    public static void main(String[] args) {
        SpringApplication.run(GdmChurchApplication.class, args);
    }
}
