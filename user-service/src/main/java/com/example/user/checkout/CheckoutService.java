package com.example.user.checkout;

import com.example.user.exception.ResourceNotFoundException;
import com.example.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CheckoutService {
    private final OrderRepository orders;
    private final UserRepository users;
    private final Catalog catalog;
    private final SavedCheckoutDetailsRepository details;

    public CheckoutService(OrderRepository orders, UserRepository users, Catalog catalog, SavedCheckoutDetailsRepository details) {
        this.orders = orders;
        this.users = users;
        this.catalog = catalog;
        this.details = details;
    }

    @Transactional
    public OrderResponse place(UUID customerId, CheckoutRequest request) {
        var previous = orders.findByCustomerIdAndCheckoutId(customerId, request.checkoutId());
        if (previous.isPresent()) return OrderResponse.from(previous.get());
        if (!users.existsById(customerId)) throw new ResourceNotFoundException("User not found");

        var seen = new HashSet<String>();
        List<OrderItem> items = request.items().stream().map(line -> {
            if (!seen.add(line.productId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate product in order");
            Catalog.Product product = catalog.get(line.productId());
            if (product == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product: " + line.productId());
            return new OrderItem(line.productId(), product.name(), line.quantity(), product.price());
        }).toList();
        CheckoutRequest.ShippingAddress address = request.shippingAddress();
        if (address == null) address = getSavedDetails(customerId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipping details are required"));
        PlacedOrder order = orders.save(new PlacedOrder(customerId, request.checkoutId(), address, items));
        if (request.shippingAddress() != null) details.save(new SavedCheckoutDetails(customerId, address));
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(UUID customerId, UUID orderId) {
        return OrderResponse.from(orders.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    @Transactional(readOnly = true)
    public Optional<CheckoutRequest.ShippingAddress> getSavedDetails(UUID customerId) {
        return details.findById(customerId).map(SavedCheckoutDetails::asAddress)
                .or(() -> orders.findFirstByCustomerIdOrderByCreatedAtDesc(customerId).map(order ->
                        new CheckoutRequest.ShippingAddress(order.getRecipientName(), order.getPhone(),
                                order.getAddressLine1(), order.getAddressLine2(), order.getCity(),
                                order.getState(), order.getPostalCode())));
    }
}
