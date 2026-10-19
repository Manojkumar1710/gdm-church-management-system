package com.gdm.church.offerings;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OfferingDto {

    /** Server-assigned — ignored on inbound submission. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private String donorName;
    private String email;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Amount must be at least 1")
    private BigDecimal amount;

    private Long purposeId;

    /** Server-resolved — ignored on inbound submission. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String purposeName;

    @NotNull(message = "Offering date is required")
    private LocalDate offeringDate;

    private String paymentMethod;
    private String paymentReference;

    /**
     * Status is always set by the server (PENDING on public submit).
     * Submitters cannot override it.
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String status;

    private boolean anonymous;
    private String notes;

    /** Server-assigned — ignored on inbound submission. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;
}
