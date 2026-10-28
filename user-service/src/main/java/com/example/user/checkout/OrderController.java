package com.example.user.checkout;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final CheckoutService checkout;

    public OrderController(CheckoutService checkout) { this.checkout = checkout; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(Authentication authentication, @Valid @RequestBody CheckoutRequest request) {
        return checkout.place(UUID.fromString(authentication.getName()), request);
    }

    @GetMapping("/{id}")
    public OrderResponse get(Authentication authentication, @PathVariable UUID id) {
        return checkout.get(UUID.fromString(authentication.getName()), id);
    }

    @GetMapping("/checkout-details")
    public ResponseEntity<CheckoutRequest.ShippingAddress> checkoutDetails(Authentication authentication) {
        return checkout.getSavedDetails(UUID.fromString(authentication.getName()))
                .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }
}
