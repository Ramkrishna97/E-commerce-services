package com.example.user.checkout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CheckoutRequest(
        @NotNull UUID checkoutId,
        @NotEmpty @Size(max = 10) List<@Valid Line> items,
        @Valid ShippingAddress shippingAddress) {

    public record Line(@NotBlank String productId, @Min(1) @Max(10) int quantity) { }

    public record ShippingAddress(
            @NotBlank @Size(max = 120) String recipientName,
            @NotBlank @Pattern(regexp = "^[+0-9() -]{7,32}$") String phone,
            @NotBlank @Size(max = 200) String addressLine1,
            @Size(max = 200) String addressLine2,
            @NotBlank @Size(max = 100) String city,
            @NotBlank @Size(max = 100) String state,
            @NotBlank @Size(max = 20) String postalCode) { }
}
