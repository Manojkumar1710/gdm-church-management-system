package com.gdm.church.songs;

import com.gdm.church.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;

    // ---- Public (permitAll in SecurityConfig) ----

    @GetMapping("/songs")
    public ResponseEntity<ApiResponse<List<SongSummary>>> list(
            @RequestParam(required = false) String q) {
        List<SongSummary> summaries = (q != null && !q.isBlank())
                ? songService.search(q)
                : songService.findAllSummaries();
        return ResponseEntity.ok(ApiResponse.success(summaries));
    }

    @GetMapping("/songs/{id}")
    public ResponseEntity<ApiResponse<Song>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(songService.getById(id)));
    }

    // ---- Admin (hasRole('ADMIN') — caught by anyRequest() catch-all) ----

    @PostMapping("/songs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Song>> create(@Valid @RequestBody Song song) {
        return ResponseEntity.ok(ApiResponse.success("Song created", songService.create(song)));
    }

    @PostMapping("/songs/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Song>>> bulkCreate(@RequestBody List<Song> songs) {
        return ResponseEntity.ok(ApiResponse.success("Songs imported", songService.bulkCreate(songs)));
    }

    @PutMapping("/songs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Song>> update(@PathVariable Long id, @Valid @RequestBody Song song) {
        return ResponseEntity.ok(ApiResponse.success("Song updated", songService.update(id, song)));
    }

    @DeleteMapping("/songs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        songService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Song deleted"));
    }
}
