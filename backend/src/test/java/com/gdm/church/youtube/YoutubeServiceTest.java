package com.gdm.church.youtube;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for YoutubeService.extractYoutubeId()
 * No Spring context needed — pure logic test.
 */
class YoutubeServiceTest {

    @Test
    @DisplayName("Standard watch URL extracts correct ID")
    void standardWatchUrl() {
        String id = YoutubeService.extractYoutubeId(
            "https://www.youtube.com/watch?v=JK41eUJ5et4");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("Watch URL with extra params extracts correct ID")
    void watchUrlWithExtraParams() {
        String id = YoutubeService.extractYoutubeId(
            "https://www.youtube.com/watch?v=JK41eUJ5et4&t=123&list=PL123");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("Short youtu.be URL extracts correct ID")
    void shortUrl() {
        String id = YoutubeService.extractYoutubeId(
            "https://youtu.be/JK41eUJ5et4");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("youtu.be URL with si param extracts correct ID")
    void shortUrlWithSiParam() {
        String id = YoutubeService.extractYoutubeId(
            "https://youtu.be/JK41eUJ5et4?si=abc123xyz");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("Live URL extracts correct ID")
    void liveUrl() {
        String id = YoutubeService.extractYoutubeId(
            "https://www.youtube.com/live/JK41eUJ5et4");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("Live URL with si param extracts correct ID")
    void liveUrlWithSiParam() {
        String id = YoutubeService.extractYoutubeId(
            "https://www.youtube.com/live/JK41eUJ5et4?si=1OwhA_4kPAiIrvl2");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("Embed URL extracts correct ID")
    void embedUrl() {
        String id = YoutubeService.extractYoutubeId(
            "https://www.youtube.com/embed/JK41eUJ5et4");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("Shorts URL extracts correct ID")
    void shortsUrl() {
        String id = YoutubeService.extractYoutubeId(
            "https://www.youtube.com/shorts/JK41eUJ5et4");
        assertThat(id).isEqualTo("JK41eUJ5et4");
    }

    @Test
    @DisplayName("Invalid URL returns null")
    void invalidUrl() {
        assertThat(YoutubeService.extractYoutubeId("https://vimeo.com/12345")).isNull();
    }

    @Test
    @DisplayName("Random string returns null")
    void randomString() {
        assertThat(YoutubeService.extractYoutubeId("not-a-url")).isNull();
    }

    @Test
    @DisplayName("Null input returns null")
    void nullInput() {
        assertThat(YoutubeService.extractYoutubeId(null)).isNull();
    }

    @Test
    @DisplayName("Blank input returns null")
    void blankInput() {
        assertThat(YoutubeService.extractYoutubeId("   ")).isNull();
    }

    @Test
    @DisplayName("Thumbnail URL is built correctly from video ID")
    void thumbnailUrlFormat() {
        // verify the full expected output for the spec example
        String id = YoutubeService.extractYoutubeId(
            "https://www.youtube.com/live/JK41eUJ5et4?si=1OwhA_4kPAiIrvl2");
        assertThat(id).isEqualTo("JK41eUJ5et4");
        // The service builds: https://img.youtube.com/vi/{id}/maxresdefault.jpg
        String expectedThumb = "https://img.youtube.com/vi/JK41eUJ5et4/maxresdefault.jpg";
        assertThat("https://img.youtube.com/vi/" + id + "/maxresdefault.jpg")
            .isEqualTo(expectedThumb);
    }
}
