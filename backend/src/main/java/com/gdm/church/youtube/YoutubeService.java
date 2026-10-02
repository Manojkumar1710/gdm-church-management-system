package com.gdm.church.youtube;

import com.gdm.church.common.exception.ApiException;
import com.gdm.church.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class YoutubeService {

    private final YoutubeRepository youtubeRepository;

    // ----------------------------------------------------------------
    // YouTube video ID extraction
    // Supports:
    //   https://www.youtube.com/watch?v=VIDEO_ID
    //   https://youtu.be/VIDEO_ID
    //   https://www.youtube.com/live/VIDEO_ID
    //   All of the above with extra query params (?si=, &t=, etc.)
    // ----------------------------------------------------------------
    private static final Pattern YT_ID_PATTERN = Pattern.compile(
        "(?:youtube\\.com/(?:watch\\?v=|live/|embed/|shorts/)|youtu\\.be/)" +
        "([A-Za-z0-9_-]{11})"
    );

    /**
     * Extracts the 11-character YouTube video ID from a URL.
     * Returns null if the URL does not contain a recognisable ID.
     */
    static String extractYoutubeId(String url) {
        if (url == null || url.isBlank()) return null;
        Matcher m = YT_ID_PATTERN.matcher(url);
        return m.find() ? m.group(1) : null;
    }

    /**
     * Generates the maxresdefault thumbnail URL for a YouTube video ID.
     */
    private static String buildThumbnailUrl(String videoId) {
        return "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";
    }

    // ----------------------------------------------------------------
    // Public API — unchanged signatures
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<YoutubeDto> getPublished(int page, int size) {
        return new PageResponse<>(
                youtubeRepository.findByPublishedTrueOrderByPublishedDateDesc(PageRequest.of(page, size))
                        .map(this::toDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<YoutubeDto> adminList(int page, int size) {
        return new PageResponse<>(
                youtubeRepository.findAllByOrderByPublishedDateDesc(PageRequest.of(page, size))
                        .map(this::toDto));
    }

    @Transactional
    public YoutubeDto create(YoutubeDto dto) {
        // Auto-generate thumbnailUrl when admin has not supplied one
        if ((dto.getThumbnailUrl() == null || dto.getThumbnailUrl().isBlank())
                && dto.getYoutubeUrl() != null) {

            String videoId = extractYoutubeId(dto.getYoutubeUrl());
            if (videoId == null) {
                // URL supplied but ID cannot be extracted → reject clearly
                throw ApiException.badRequest(
                    "Could not extract a YouTube video ID from the URL: " + dto.getYoutubeUrl() +
                    ". Supported formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/live/ID"
                );
            }
            dto.setThumbnailUrl(buildThumbnailUrl(videoId));
        }

        YoutubeVideo v = new YoutubeVideo();
        apply(v, dto);
        return toDto(youtubeRepository.save(v));
    }

    @Transactional
    public YoutubeDto update(Long id, YoutubeDto dto) {
        // update() is unchanged — no auto-generation so existing records are untouched
        YoutubeVideo v = youtubeRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("YouTube video"));
        apply(v, dto);
        return toDto(youtubeRepository.save(v));
    }

    @Transactional
    public void delete(Long id) {
        youtubeRepository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // Private helpers — unchanged
    // ----------------------------------------------------------------

    private YoutubeDto toDto(YoutubeVideo v) {
        return YoutubeDto.builder()
                .id(v.getId())
                .title(v.getTitle())
                .description(v.getDescription())
                .youtubeUrl(v.getYoutubeUrl())
                .thumbnailUrl(v.getThumbnailUrl())
                .category(v.getCategory())
                .publishedDate(v.getPublishedDate())
                .published(v.isPublished())
                .createdAt(v.getCreatedAt())
                .build();
    }

    private void apply(YoutubeVideo v, YoutubeDto dto) {
        if (dto.getTitle()        != null) v.setTitle(dto.getTitle());
        if (dto.getDescription()  != null) v.setDescription(dto.getDescription());
        if (dto.getYoutubeUrl()   != null) v.setYoutubeUrl(dto.getYoutubeUrl());
        if (dto.getThumbnailUrl() != null) v.setThumbnailUrl(dto.getThumbnailUrl());
        if (dto.getCategory()     != null) v.setCategory(dto.getCategory());
        if (dto.getPublishedDate()!= null) v.setPublishedDate(dto.getPublishedDate());
        v.setPublished(dto.isPublished());
    }
}
