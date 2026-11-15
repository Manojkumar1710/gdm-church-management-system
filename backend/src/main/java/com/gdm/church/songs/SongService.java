package com.gdm.church.songs;

import com.gdm.church.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SongService {

    private final SongRepository songRepository;

    private static final int MAX_TITLE_LENGTH   = 255;
    private static final int MAX_CATEGORY_LENGTH = 100;
    private static final int MAX_BULK_SIZE      = 1000;
    private static final int MAX_ERRORS         = 20;

    @Transactional(readOnly = true)
    public List<SongSummary> findAllSummaries() {
        return songRepository.findAllSummaries();
    }

    @Transactional(readOnly = true)
    public List<SongSummary> search(String q) {
        return songRepository.searchSummaries(q);
    }

    @Transactional(readOnly = true)
    public Song getById(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Song"));
    }

    // ---- Admin --------------------------------------------------------

    @Transactional
    public Song create(Song song) {
        song.setId(null);

        List<String> errors = new ArrayList<>();
        validateSong(song, "Song", errors);
        if (!errors.isEmpty()) {
            throw ApiException.badRequest(formatErrors(errors));
        }

        applyDefaults(song);

        if (song.getSongNumber() != null && songRepository.existsBySongNumber(song.getSongNumber())) {
            throw ApiException.conflict("Song number " + song.getSongNumber() + " already exists");
        }
        return songRepository.save(song);
    }

    /**
     * All-or-nothing bulk import.  Validation runs first, then duplicate
     * detection, then save.  Nothing is persisted if any error is found.
     */
    @Transactional
    public List<Song> bulkCreate(List<Song> songs) {
        if (songs == null || songs.isEmpty()) {
            throw ApiException.badRequest("Bulk import must contain at least one song");
        }
        if (songs.size() > MAX_BULK_SIZE) {
            throw ApiException.badRequest("Bulk import limited to " + MAX_BULK_SIZE + " songs per request");
        }

        songs.forEach(s -> s.setId(null));

        // ---- 1. Validate every song (before duplicate check) ----
        List<String> errors = new ArrayList<>();
        for (int i = 0; i < songs.size(); i++) {
            validateSong(songs.get(i), songLabel(i, songs.get(i)), errors);
        }
        if (!errors.isEmpty()) {
            throw ApiException.badRequest(formatErrors(errors));
        }

        songs.forEach(this::applyDefaults);

        // ---- 2. Duplicate detection ----
        List<Integer> payloadNumbers = songs.stream()
                .map(Song::getSongNumber)
                .filter(Objects::nonNull)
                .toList();

        Set<Integer> seen = new HashSet<>();
        Set<Integer> duplicates = new LinkedHashSet<>();
        for (Integer num : payloadNumbers) {
            if (!seen.add(num)) {
                duplicates.add(num);
            }
        }
        if (!payloadNumbers.isEmpty()) {
            duplicates.addAll(songRepository.findSongNumbersIn(payloadNumbers));
        }
        if (!duplicates.isEmpty()) {
            throw ApiException.conflict("Duplicate song numbers: " +
                    duplicates.stream()
                            .sorted()
                            .map(String::valueOf)
                            .collect(Collectors.joining(", ")));
        }

        // ---- 3. Save ----
        return songRepository.saveAll(songs);
    }

    @Transactional
    public Song update(Long id, Song dto) {
        Song existing = songRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Song"));

        List<String> errors = new ArrayList<>();
        validateSong(dto, "Song", errors);
        if (!errors.isEmpty()) {
            throw ApiException.badRequest(formatErrors(errors));
        }

        if (dto.getSongNumber() != null && !dto.getSongNumber().equals(existing.getSongNumber())) {
            if (songRepository.existsBySongNumber(dto.getSongNumber())) {
                throw ApiException.conflict("Song number " + dto.getSongNumber() + " already exists");
            }
        }

        existing.setSongNumber(dto.getSongNumber());
        existing.setTitleTe(dto.getTitleTe());
        existing.setTitleEn(dto.getTitleEn());
        existing.setLyricsTe(dto.getLyricsTe());
        existing.setLyricsEn(dto.getLyricsEn());
        if (dto.getCategory() != null && !dto.getCategory().isBlank()) {
            existing.setCategory(dto.getCategory());
        }
        return songRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!songRepository.existsById(id)) {
            throw ApiException.notFound("Song");
        }
        songRepository.deleteById(id);
    }

    // ---- Validation helpers ------------------------------------------

    private void validateSong(Song song, String label, List<String> errors) {
        // titleTe
        if (song.getTitleTe() == null || song.getTitleTe().isBlank()) {
            errors.add(label + ": titleTe is required");
        } else {
            song.setTitleTe(song.getTitleTe().trim());
            if (song.getTitleTe().length() > MAX_TITLE_LENGTH) {
                errors.add(label + ": titleTe exceeds " + MAX_TITLE_LENGTH + " characters");
            }
        }
        // titleEn
        if (song.getTitleEn() == null || song.getTitleEn().isBlank()) {
            errors.add(label + ": titleEn is required");
        } else {
            song.setTitleEn(song.getTitleEn().trim());
            if (song.getTitleEn().length() > MAX_TITLE_LENGTH) {
                errors.add(label + ": titleEn exceeds " + MAX_TITLE_LENGTH + " characters");
            }
        }
        // lyricsTe
        if (song.getLyricsTe() == null || song.getLyricsTe().isBlank()) {
            errors.add(label + ": lyricsTe is required");
        } else {
            song.setLyricsTe(song.getLyricsTe().trim());
        }
        // lyricsEn
        if (song.getLyricsEn() == null || song.getLyricsEn().isBlank()) {
            errors.add(label + ": lyricsEn is required");
        } else {
            song.setLyricsEn(song.getLyricsEn().trim());
        }
        // songNumber — must be positive if present
        if (song.getSongNumber() != null && song.getSongNumber() <= 0) {
            errors.add(label + ": songNumber must be a positive integer");
        }
        // category — max length
        if (song.getCategory() != null) {
            song.setCategory(song.getCategory().trim());
            if (song.getCategory().length() > MAX_CATEGORY_LENGTH) {
                errors.add(label + ": category exceeds " + MAX_CATEGORY_LENGTH + " characters");
            }
        }
    }

    private String songLabel(int index, Song song) {
        int num = index + 1;
        if (song.getSongNumber() != null) {
            return "Song " + num + " (number " + song.getSongNumber() + ")";
        }
        return "Song " + num + " (no number)";
    }

    private String formatErrors(List<String> errors) {
        if (errors.size() <= MAX_ERRORS) {
            return String.join("; ", errors);
        }
        return String.join("; ", errors.subList(0, MAX_ERRORS))
                + "; ...and " + (errors.size() - MAX_ERRORS) + " more";
    }

    private void applyDefaults(Song song) {
        if (song.getCategory() == null || song.getCategory().isBlank()) {
            song.setCategory("General");
        }
    }
}
