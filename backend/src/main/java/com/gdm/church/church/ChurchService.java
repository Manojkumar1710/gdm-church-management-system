package com.gdm.church.church;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.config.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChurchService {

    private final ChurchRepository churchRepository;
    private final HeroRepository heroRepository;
    private final CloudinaryService cloudinaryService;

    // ----------------------------------------------------------------
    // Church Information
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public ChurchDto getChurchInfo() {
        return churchRepository.findById(1L)
                .map(this::toChurchDto)
                .orElseThrow(() -> ApiException.notFound("Church information"));
    }

    @Transactional
    public ChurchDto upsertChurchInfo(ChurchDto dto) {
        ChurchInformation info = churchRepository.findById(1L)
                .orElse(new ChurchInformation());
        applyChurchDto(info, dto);
        return toChurchDto(churchRepository.save(info));
    }

    // ----------------------------------------------------------------
    // Hero Section
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public HeroDto getActiveHero() {
        return heroRepository.findFirstByActiveTrue()
                .map(this::toHeroDto)
                .orElseThrow(() -> ApiException.notFound("Hero section"));
    }

    @Transactional(readOnly = true)
    public List<HeroDto> getAllHeroes() {
        return heroRepository.findAll().stream().map(this::toHeroDto).toList();
    }

    @Transactional
    public HeroDto createHero(HeroDto dto) {
        HeroSection hero = new HeroSection();
        applyHeroDto(hero, dto);
        return toHeroDto(heroRepository.save(hero));
    }

    @Transactional
    public HeroDto updateHero(Long id, HeroDto dto) {
        HeroSection hero = heroRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Hero section"));
        applyHeroDto(hero, dto);
        return toHeroDto(heroRepository.save(hero));
    }

    @Transactional
    public HeroDto uploadHeroImage(Long id, MultipartFile file) {
        HeroSection hero = heroRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Hero section"));
        String url = cloudinaryService.uploadImage(file, "hero");
        hero.setBackgroundImageUrl(url);
        return toHeroDto(heroRepository.save(hero));
    }

    @Transactional
    public void deleteHero(Long id) {
        heroRepository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // Seed
    // ----------------------------------------------------------------

    @Bean
    public CommandLineRunner seedChurchInfo() {
        return args -> {
            if (!churchRepository.existsById(1L)) {
                ChurchInformation info = ChurchInformation.builder()
                        .name("GDM Church")
                        .tagline("Grace, Devotion and Mercy")
                        .description("GDM Church is a vibrant, welcoming community of believers dedicated to worship, fellowship and service.")
                        .history("Founded with a heart for the community, GDM Church has grown over the years to become a beacon of hope and love.")
                        .vision("To be a transformative church that brings the love of Christ to every village and community.")
                        .mission("Preaching the Gospel, nurturing believers and serving our community with grace and compassion.")
                        .address("GDM Church, Main Street, Village, District, State")
                        .phone("+91-9999999999")
                        .email("info@gdmchurch.org")
                        .build();
                churchRepository.save(info);
            }

            if (heroRepository.count() == 0) {
                HeroSection hero = HeroSection.builder()
                        .title("Welcome to GDM Church")
                        .subtitle("A place of Grace, Devotion and Mercy — where every soul finds belonging.")
                        .primaryCtaText("Upcoming Events")
                        .primaryCtaUrl("/events")
                        .secondaryCtaText("Watch Sermons")
                        .secondaryCtaUrl("/sermons")
                        .active(true)
                        .build();
                heroRepository.save(hero);
            }
        };
    }

    // ----------------------------------------------------------------
    // Mapping helpers
    // ----------------------------------------------------------------

    private ChurchDto toChurchDto(ChurchInformation info) {
        return ChurchDto.builder()
                .id(info.getId())
                .name(info.getName())
                .tagline(info.getTagline())
                .description(info.getDescription())
                .history(info.getHistory())
                .vision(info.getVision())
                .mission(info.getMission())
                .address(info.getAddress())
                .phone(info.getPhone())
                .email(info.getEmail())
                .mapUrl(info.getMapUrl())
                .updatedAt(info.getUpdatedAt())
                .build();
    }

    private void applyChurchDto(ChurchInformation info, ChurchDto dto) {
        if (dto.getName() != null) info.setName(dto.getName());
        if (dto.getTagline() != null) info.setTagline(dto.getTagline());
        if (dto.getDescription() != null) info.setDescription(dto.getDescription());
        if (dto.getHistory() != null) info.setHistory(dto.getHistory());
        if (dto.getVision() != null) info.setVision(dto.getVision());
        if (dto.getMission() != null) info.setMission(dto.getMission());
        if (dto.getAddress() != null) info.setAddress(dto.getAddress());
        if (dto.getPhone() != null) info.setPhone(dto.getPhone());
        if (dto.getEmail() != null) info.setEmail(dto.getEmail());
        if (dto.getMapUrl() != null) info.setMapUrl(dto.getMapUrl());
    }

    private HeroDto toHeroDto(HeroSection h) {
        return HeroDto.builder()
                .id(h.getId())
                .title(h.getTitle())
                .subtitle(h.getSubtitle())
                .backgroundImageUrl(h.getBackgroundImageUrl())
                .primaryCtaText(h.getPrimaryCtaText())
                .primaryCtaUrl(h.getPrimaryCtaUrl())
                .secondaryCtaText(h.getSecondaryCtaText())
                .secondaryCtaUrl(h.getSecondaryCtaUrl())
                .active(h.isActive())
                .build();
    }

    private void applyHeroDto(HeroSection h, HeroDto dto) {
        if (dto.getTitle() != null) h.setTitle(dto.getTitle());
        if (dto.getSubtitle() != null) h.setSubtitle(dto.getSubtitle());
        if (dto.getBackgroundImageUrl() != null) h.setBackgroundImageUrl(dto.getBackgroundImageUrl());
        if (dto.getPrimaryCtaText() != null) h.setPrimaryCtaText(dto.getPrimaryCtaText());
        if (dto.getPrimaryCtaUrl() != null) h.setPrimaryCtaUrl(dto.getPrimaryCtaUrl());
        if (dto.getSecondaryCtaText() != null) h.setSecondaryCtaText(dto.getSecondaryCtaText());
        if (dto.getSecondaryCtaUrl() != null) h.setSecondaryCtaUrl(dto.getSecondaryCtaUrl());
        h.setActive(dto.isActive());
    }
}
