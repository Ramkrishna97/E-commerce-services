package com.example.user.checkout;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(UUID id, String status, String paymentMethod, BigDecimal total, String currency,
                            String recipientName, String addressLine1, String city, String state, String postalCode,
                            Instant createdAt, List<Line> items) {
    public record Line(String productId, String productName, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) { }

    static OrderResponse from(PlacedOrder order) {
        return new OrderResponse(order.getId(), order.getStatus(), order.getPaymentMethod(), order.getTotal(), "INR",
                order.getRecipientName(), order.getAddressLine1(), order.getCity(), order.getState(), order.getPostalCode(),
                order.getCreatedAt(), order.getItems().stream().map(item ->
                        new Line(item.getProductId(), item.getProductName(), item.getQuantity(), item.getUnitPrice(), item.getLineTotal())).toList());
    }
}
