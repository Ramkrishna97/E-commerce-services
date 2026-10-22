package com.example.user.application;

import com.example.user.dto.*;
import com.example.user.exception.ConflictException;
import com.example.user.exception.ResourceNotFoundException;
import com.example.user.exception.UnauthorizedException;
import com.example.user.model.Role;
import com.example.user.model.User;
import com.example.user.repository.RoleRepository;
import com.example.user.repository.UserRepository;
import com.example.user.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class AuthService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokens;
    public AuthService(UserRepository users, RoleRepository roles, PasswordEncoder passwordEncoder, JwtTokenProvider tokens) {
        this.users = users; this.roles = roles; this.passwordEncoder = passwordEncoder; this.tokens = tokens;
    }
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new ConflictException("An account already exists for this email address");
        String requestedRole = request.role() == null ? "ROLE_CUSTOMER" : "ROLE_" + request.role().trim().toUpperCase(Locale.ROOT).replace("ROLE_", "");
        if (!Set.of("ROLE_CUSTOMER", "ROLE_SELLER").contains(requestedRole)) throw new ConflictException("Self-registration is allowed only for CUSTOMER or SELLER");
        Role role = roles.findByName(requestedRole).orElseGet(() -> roles.save(Role.builder().name(requestedRole).build()));
        User user = User.builder().email(email).passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName().trim()).lastName(request.lastName().trim()).phoneNumber(request.phoneNumber()).roles(Set.of(role)).build();
        return toResponse(users.save(user));
    }
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email().trim().toLowerCase(Locale.ROOT)).orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!"ACTIVE".equals(user.getStatus()) || !passwordEncoder.matches(request.password(), user.getPasswordHash())) throw new UnauthorizedException("Invalid email or password");
        return issueTokens(user);
    }
    @Transactional(readOnly = true)
    public TokenResponse refresh(RefreshTokenRequest request) {
        var claims = tokens.parseRefreshToken(request.refreshToken()).orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));
        User user = users.findById(UUID.fromString(claims.getSubject())).orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));
        return issueTokens(user);
    }
    @Transactional(readOnly = true)
    public UserResponse currentUser(String id) { return toResponse(users.findById(UUID.fromString(id)).orElseThrow(() -> new ResourceNotFoundException("User not found"))); }
    private TokenResponse issueTokens(User user) { return new TokenResponse(tokens.generateAccessToken(user), tokens.generateRefreshToken(user), "Bearer", tokens.accessTokenExpirationSeconds()); }
    private UserResponse toResponse(User user) { return new UserResponse(user.getId().toString(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getPhoneNumber(), user.getStatus(), user.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toUnmodifiableSet())); }
}
