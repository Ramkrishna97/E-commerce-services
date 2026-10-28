package com.example.user.checkout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SavedCheckoutDetailsRepository extends JpaRepository<SavedCheckoutDetails, UUID> { }
