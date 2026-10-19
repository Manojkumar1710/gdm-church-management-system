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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    /** Allowed declared Content-Types (first-pass check). */
    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    /** Safe extension mapping; keys are allowed declared types. */
    private static final Map<String, String> TYPE_TO_EXT = Map.of(
            "image/jpeg", ".jpg",
            "image/png",  ".png",
            "image/webp", ".webp"
    );

    /** Maximum file size: 10 MB. */
    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024;

    // ── JPEG magic: FF D8 FF
    private static final byte[] JPEG_MAGIC = {(byte)0xFF, (byte)0xD8, (byte)0xFF};
    // ── PNG magic: 89 50 4E 47 0D 0A 1A 0A
    private static final byte[] PNG_MAGIC  = {(byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    // ── WebP: bytes 0-3 = "RIFF", bytes 8-11 = "WEBP"
    private static final byte[] RIFF_MAGIC = {0x52, 0x49, 0x46, 0x46};
    private static final byte[] WEBP_MAGIC = {0x57, 0x45, 0x42, 0x50};

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Upload an image to Cloudinary, or save locally in development.
     * Validates Content-Type, magic bytes, and file size.
     */
    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file);

        if (isCloudinaryConfigured()) {
            return uploadToCloudinary(file, folder);
        } else {
            log.warn("Cloudinary not configured. Saving file locally (development only).");
            return saveLocally(file, folder);
        }
    }

    /** Delete a Cloudinary asset by public ID. No-op in local mode. */
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        if (!isCloudinaryConfigured()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("Could not delete Cloudinary image (publicId={}): {}", publicId, e.getMessage());
        }
    }

    // ── private helpers ────────────────────────────────────────────

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
                    "public_id",     publicId,
                    "overwrite",     true,
                    "resource_type", "image",
                    "quality",       "auto",
                    "fetch_format",  "auto"
            ));
            return (String) result.get("secure_url");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Invalid cloud_name")) {
                log.warn("Cloudinary cloud_name '{}' is invalid. Falling back to local storage.", cloudName);
                return saveLocally(file, folder);
            }
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw ApiException.badRequest("Image upload failed. Please try again.");
        } catch (IOException e) {
            log.error("Cloudinary upload I/O error", e);
            throw ApiException.badRequest("Image upload failed. Please try again.");
        }
    }

    private String saveLocally(MultipartFile file, String folder) {
        try {
            Path uploadsDir = Paths.get(System.getProperty("user.dir"), "uploads", folder)
                    .toAbsolutePath().normalize();
            Files.createDirectories(uploadsDir);

            // Derive extension from validated content type — never from client-supplied filename
            String ext = safeExtension(file.getContentType());
            String filename = UUID.randomUUID() + ext;
            Path dest = uploadsDir.resolve(filename).normalize();

            // Guard against path traversal: dest must be inside uploadsDir
            if (!dest.startsWith(uploadsDir)) {
                throw ApiException.badRequest("Invalid upload path.");
            }

            file.transferTo(dest.toFile());
            log.info("File saved locally: {}", dest);
            return "http://localhost:" + serverPort + "/uploads/" + folder + "/" + filename;
        } catch (IOException e) {
            log.error("Local file save failed: {}", e.getMessage(), e);
            // Do not expose filesystem path to caller
            throw ApiException.badRequest("Image could not be saved. Please try again.");
        }
    }

    /**
     * Returns a safe extension derived from the validated MIME type.
     * Never trusts the client-supplied filename.
     */
    private String safeExtension(String contentType) {
        if (contentType == null) return ".jpg";
        return TYPE_TO_EXT.getOrDefault(contentType.toLowerCase(), ".jpg");
    }

    /**
     * Validates the file:
     *  1. Not null/empty
     *  2. Within size limit
     *  3. Declared Content-Type is in the allowed set
     *  4. Actual magic bytes match the declared type (prevents polyglot/disguised files)
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("No file provided.");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw ApiException.badRequest("File exceeds the 10 MB size limit.");
        }

        String declaredType = file.getContentType();
        if (declaredType == null || !ALLOWED_CONTENT_TYPES.contains(declaredType.toLowerCase())) {
            throw ApiException.badRequest("Only JPEG, PNG and WebP images are allowed.");
        }

        // Read magic bytes and cross-check with declared type
        try (InputStream in = file.getInputStream()) {
            byte[] header = in.readNBytes(12);
            if (!magicMatchesDeclaredType(header, declaredType.toLowerCase())) {
                log.warn("Magic bytes mismatch: declared={}, actual header bytes do not match",
                        declaredType);
                throw ApiException.badRequest("File content does not match the declared image type.");
            }
        } catch (IOException e) {
            throw ApiException.badRequest("Could not read uploaded file.");
        }
    }

    private boolean magicMatchesDeclaredType(byte[] header, String declaredType) {
        return switch (declaredType) {
            case "image/jpeg" -> startsWith(header, JPEG_MAGIC);
            case "image/png"  -> startsWith(header, PNG_MAGIC);
            case "image/webp" -> startsWith(header, RIFF_MAGIC)
                                 && header.length >= 12
                                 && startsWith(subArray(header, 8, 4), WEBP_MAGIC);
            default           -> false;
        };
    }

    private boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    private byte[] subArray(byte[] src, int offset, int len) {
        byte[] out = new byte[len];
        System.arraycopy(src, offset, out, 0, Math.min(len, src.length - offset));
        return out;
    }
}
