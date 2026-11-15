package com.gdm.church.songs;

/**
 * Lightweight projection used by the list/search endpoints so that
 * the full lyrics (LONGTEXT) are never returned when only a summary
 * is needed.
 */
public interface SongSummary {
    Long getId();
    Integer getSongNumber();
    String getTitleTe();
    String getTitleEn();
    String getCategory();
}
