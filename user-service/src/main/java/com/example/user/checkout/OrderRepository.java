package com.example.user.checkout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<PlacedOrder, UUID> {
    Optional<PlacedOrder> findByCustomerIdAndCheckoutId(UUID customerId, UUID checkoutId);
    Optional<PlacedOrder> findByIdAndCustomerId(UUID id, UUID customerId);
    Optional<PlacedOrder> findFirstByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}
