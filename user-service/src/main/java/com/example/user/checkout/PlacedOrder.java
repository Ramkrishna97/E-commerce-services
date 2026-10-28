package com.example.user.checkout;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "placed_orders", uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "checkout_id"}))
public class PlacedOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;
    @Column(name = "checkout_id", nullable = false)
    private UUID checkoutId;
    @Column(nullable = false, length = 30)
    private String status = "PLACED";
    @Column(nullable = false, length = 30)
    private String paymentMethod = "CASH_ON_DELIVERY";
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
    @Column(nullable = false, length = 2)
    private String countryCode = "IN";
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal total;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "placed_order_items", joinColumns = @JoinColumn(name = "order_id"))
    private List<OrderItem> items = new ArrayList<>();

    protected PlacedOrder() { }

    PlacedOrder(UUID customerId, UUID checkoutId, CheckoutRequest.ShippingAddress address, List<OrderItem> items) {
        this.customerId = customerId;
        this.checkoutId = checkoutId;
        this.recipientName = address.recipientName().trim();
        this.phone = address.phone().trim();
        this.addressLine1 = address.addressLine1().trim();
        this.addressLine2 = address.addressLine2() == null ? "" : address.addressLine2().trim();
        this.city = address.city().trim();
        this.state = address.state().trim();
        this.postalCode = address.postalCode().trim();
        this.items.addAll(items);
        this.total = items.stream().map(OrderItem::getLineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public UUID getId() { return id; }
    public UUID getCustomerId() { return customerId; }
    public UUID getCheckoutId() { return checkoutId; }
    public String getStatus() { return status; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getRecipientName() { return recipientName; }
    public String getPhone() { return phone; }
    public String getAddressLine1() { return addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getPostalCode() { return postalCode; }
    public String getCountryCode() { return countryCode; }
    public BigDecimal getTotal() { return total; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }
}
