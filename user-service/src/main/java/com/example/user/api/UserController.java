package com.example.user.api;

import com.example.user.application.AuthService;
import com.example.user.dto.UserResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final AuthService authService;
    public UserController(AuthService authService) { this.authService = authService; }
    @GetMapping("/me") public UserResponse me(Authentication authentication) { return authService.currentUser(authentication.getName()); }
}
