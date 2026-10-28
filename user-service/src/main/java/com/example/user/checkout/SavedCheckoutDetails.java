package com.example.user.checkout;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "saved_checkout_details")
public class SavedCheckoutDetails {
    @Id
    private UUID customerId;
    @Column(nullable = false, length = 120)
    private String recipientName;
    @Column(nullable = false, length = 32)
    private String phone;
    @Column(nullable = false, length = 200)
    private String addressLine1;
    @Column(nullable = false, length = 200)
    private String addressLine2;
    @Column(nullable = false, length = 100)
    private String city;
    @Column(nullable = false, length = 100)
    private String state;
    @Column(nullable = false, length = 20)
    private String postalCode;

    protected SavedCheckoutDetails() { }

    SavedCheckoutDetails(UUID customerId, CheckoutRequest.ShippingAddress address) {
        this.customerId = customerId;
        this.recipientName = address.recipientName().trim();
        this.phone = address.phone().trim();
        this.addressLine1 = address.addressLine1().trim();
        this.addressLine2 = address.addressLine2() == null ? "" : address.addressLine2().trim();
        this.city = address.city().trim();
        this.state = address.state().trim();
        this.postalCode = address.postalCode().trim();
    }

    CheckoutRequest.ShippingAddress asAddress() {
        return new CheckoutRequest.ShippingAddress(recipientName, phone, addressLine1, addressLine2,
                city, state, postalCode);
    }
}
