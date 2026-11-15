package com.gdm.church.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ----------------------------------------------------------------
    // Validation errors
    // ----------------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("VALIDATION_ERROR")
                .message("Validation failed")
                .fieldErrors(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    // ----------------------------------------------------------------
    // Our own business exceptions
    // ----------------------------------------------------------------
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(ex.getStatus().value())
                .code(ex.getCode())
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    // ----------------------------------------------------------------
    // Security
    // ----------------------------------------------------------------
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.UNAUTHORIZED.value())
                .code("INVALID_CREDENTIALS")
                .message("Invalid email or password")
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.FORBIDDEN.value())
                .code("ACCESS_DENIED")
                .message("You do not have permission to perform this action")
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // ----------------------------------------------------------------
    // File upload size
    // ----------------------------------------------------------------
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUpload(MaxUploadSizeExceededException ex) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("FILE_TOO_LARGE")
                .message("Uploaded file exceeds the maximum allowed size")
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    // ----------------------------------------------------------------
    // Database constraint violations (safety net — songs & others)
    // The raw SQL / root-cause message is logged server-side only;
    // the client receives a generic message.
    // ----------------------------------------------------------------
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        Throwable root = ex.getRootCause();
        String rootMessage = root != null ? root.getMessage() : ex.getMessage();
        boolean isDuplicate = rootMessage != null && rootMessage.toLowerCase().contains("duplicate");
        HttpStatus status = isDuplicate ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;

        log.warn("Data integrity violation ({}): {}",
                isDuplicate ? "duplicate" : "invalid data", rootMessage);

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(status.value())
                .code(isDuplicate ? "DUPLICATE" : "DATA_INTEGRITY")
                .message(isDuplicate ? "Duplicate value" : "Invalid data")
                .build();
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        // Log full property paths server-side for debugging
        log.warn("Constraint violation: {}", ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + " " + v.getMessage())
                .collect(Collectors.joining("; ")));

        // Return only the field name + our own validation message to the client
        String message = ex.getConstraintViolations().stream()
                .map(v -> extractFieldName(v) + " " + v.getMessage())
                .collect(Collectors.joining("; "));
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("CONSTRAINT_VIOLATION")
                .message(message)
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Extracts just the field name from a constraint violation's property path,
     * discarding class names, method names, and container indices.
     * e.g. "bulkCreate.songs[0].titleTe" -> "titleTe"
     */
    private String extractFieldName(ConstraintViolation<?> v) {
        String path = v.getPropertyPath().toString();
        int lastDot = path.lastIndexOf('.');
        return lastDot >= 0 ? path.substring(lastDot + 1) : path;
    }

    // ----------------------------------------------------------------
    // Method-level validation (Spring 6.1+ — e.g. @Valid on List params)
    // Safety net: returns 400 with field messages only, never a 500.
    // ----------------------------------------------------------------
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleHandlerMethodValidation(HandlerMethodValidationException ex) {
        log.warn("Handler method validation failure: {}", ex.getMessage());

        StringBuilder sb = new StringBuilder();
        for (var result : ex.getAllValidationResults()) {
            for (var error : result.getResolvableErrors()) {
                String msg = error.getDefaultMessage();
                if (msg != null && !msg.isEmpty()) {
                    if (sb.length() > 0) sb.append("; ");
                    sb.append(msg);
                }
            }
        }
        String message = sb.length() > 0 ? sb.toString() : "Validation failed";

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("VALIDATION_ERROR")
                .message(message)
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    // ----------------------------------------------------------------
    // Generic fallback
    // ----------------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .code("INTERNAL_ERROR")
                .message("An unexpected error occurred. Please try again later.")
                .build();
        return ResponseEntity.internalServerError().body(body);
    }
}
