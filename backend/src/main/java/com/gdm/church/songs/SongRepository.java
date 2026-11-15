package com.gdm.church.songs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SongRepository extends JpaRepository<Song, Long> {

    /**
     * All songs ordered by song number — lyrics excluded.
     */
    @Query("SELECT s.id AS id, s.songNumber AS songNumber, s.titleTe AS titleTe, " +
           "s.titleEn AS titleEn, s.category AS category " +
           "FROM Song s ORDER BY s.songNumber")
    List<SongSummary> findAllSummaries();

    /**
     * Search by song number (cast to string), English title (case-insensitive)
     * or Telugu title. Lyrics are NOT searched (slow on LONGTEXT).
     */
    @Query("SELECT s.id AS id, s.songNumber AS songNumber, s.titleTe AS titleTe, " +
           "s.titleEn AS titleEn, s.category AS category " +
           "FROM Song s " +
           "WHERE CAST(s.songNumber AS string) LIKE CONCAT('%', :kw, '%') " +
           "OR LOWER(s.titleEn) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR s.titleTe LIKE CONCAT('%', :kw, '%') " +
           "ORDER BY s.songNumber")
    List<SongSummary> searchSummaries(@Param("kw") String kw);

    boolean existsBySongNumber(Integer songNumber);

    @Query("SELECT s.songNumber FROM Song s WHERE s.songNumber IN :numbers")
    List<Integer> findSongNumbersIn(@Param("numbers") Collection<Integer> numbers);
}
