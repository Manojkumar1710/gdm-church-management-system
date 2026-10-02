package com.gdm.church.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gdm.church.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "image/jpg");
    private static final long MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Upload an image. Uses Cloudinary when configured; falls back to local
     * disk storage when Cloudinary credentials are placeholder/missing so
     * development works without a Cloudinary account.
     */
    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file);

        if (isCloudinaryConfigured()) {
            return uploadToCloudinary(file, folder);
        } else {
            log.warn("Cloudinary is not configured (placeholder credentials). Saving file locally.");
            return saveLocally(file, folder);
        }
    }

    /** Delete by public ID — no-op when Cloudinary is not configured. */
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        if (!isCloudinaryConfigured()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("Could not delete Cloudinary image: {}", publicId, e);
        }
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private boolean isCloudinaryConfigured() {
        return cloudName != null
                && !cloudName.isBlank()
                && !cloudName.equalsIgnoreCase("placeholder")
                && !cloudName.equalsIgnoreCase("your_cloud_name");
    }

    private String uploadToCloudinary(MultipartFile file, String folder) {
        try {
            String publicId = folder + "/" + UUID.randomUUID();
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            ));
            return (String) result.get("secure_url");
        } catch (RuntimeException e) {
            // Cloudinary config is invalid (e.g. wrong cloud name) — fall back to local storage
            if (e.getMessage() != null && e.getMessage().contains("Invalid cloud_name")) {
                log.warn("Cloudinary cloud_name '{}' is invalid. Falling back to local storage.", cloudName);
                return saveLocally(file, folder);
            }
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new ApiException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "UPLOAD_FAILED",
                    "Image upload failed: " + e.getMessage()
            );
        } catch (IOException e) {
            log.error("Cloudinary upload I/O failed", e);
            throw new ApiException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "UPLOAD_FAILED",
                    "Image upload failed: " + e.getMessage()
            );
        }
    }

    /**
     * Local fallback — saves to uploads/ directory in the project and
     * returns a URL path that Tomcat can serve from /uploads/**.
     */
    private String saveLocally(MultipartFile file, String folder) {
        try {
            // Use an absolute path so both createDirectories and transferTo
            // resolve against the same location (cwd = backend project root).
            Path uploadsDir = Paths.get(System.getProperty("user.dir"), "uploads", folder)
                    .toAbsolutePath().normalize();
            Files.createDirectories(uploadsDir);

            String ext = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;
            Path dest = uploadsDir.resolve(filename);

            // transferTo requires a File object from an absolute path
            file.transferTo(dest.toAbsolutePath().toFile());

            log.info("File saved locally: {}", dest);
            return "http://localhost:" + serverPort + "/uploads/" + folder + "/" + filename;
        } catch (IOException e) {
            log.error("Local file save failed: {}", e.getMessage(), e);
            throw new ApiException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "UPLOAD_FAILED",
                    "Image could not be saved locally: " + e.getMessage()
            );
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("No file provided");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw ApiException.badRequest("File size exceeds 20 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw ApiException.badRequest("Only JPG, PNG and WebP images are allowed");
        }
    }
}
