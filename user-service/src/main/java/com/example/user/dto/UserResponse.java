package com.example.user.dto;

import java.util.Set;

public record UserResponse(String id, String email, String firstName, String lastName, String phoneNumber,
                           String status, Set<String> roles) { }
