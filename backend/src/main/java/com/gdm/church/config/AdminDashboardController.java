package com.gdm.church.config;

import com.gdm.church.common.response.ApiResponse;
import com.gdm.church.contact.ContactRepository;
import com.gdm.church.eventphotos.EventPhotoRepository;
import com.gdm.church.events.EventRepository;
import com.gdm.church.gallery.GalleryRepository;
import com.gdm.church.offerings.OfferingRepository;
import com.gdm.church.pastors.PastorRepository;
import com.gdm.church.prayers.PrayerRepository;
import com.gdm.church.sermons.SermonRepository;
import com.gdm.church.sundayschool.children.ChildRepository;
import com.gdm.church.sundayschool.teachers.TeacherRepository;
import com.gdm.church.youtube.YoutubeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final EventRepository eventRepo;
    private final EventPhotoRepository photoRepo;
    private final PastorRepository pastorRepo;
    private final SermonRepository sermonRepo;
    private final YoutubeRepository youtubeRepo;
    private final GalleryRepository galleryRepo;
    private final OfferingRepository offeringRepo;
    private final PrayerRepository prayerRepo;
    private final ContactRepository contactRepo;
    private final ChildRepository childRepo;
    private final TeacherRepository teacherRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Long>>> stats() {
        Map<String, Long> stats = Map.ofEntries(
                Map.entry("totalEvents", eventRepo.count()),
                Map.entry("totalPhotos", photoRepo.count()),
                Map.entry("totalPastors", pastorRepo.count()),
                Map.entry("totalSermons", sermonRepo.count()),
                Map.entry("totalYoutubeVideos", youtubeRepo.count()),
                Map.entry("totalGalleryItems", galleryRepo.count()),
                Map.entry("totalOfferings", offeringRepo.count()),
                Map.entry("totalPrayerRequests", prayerRepo.count()),
                Map.entry("totalContactMessages", contactRepo.count()),
                Map.entry("totalChildren", childRepo.count()),
                Map.entry("totalTeachers", teacherRepo.count())
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
