package com.example.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.config.JwtService;
import com.example.backend.dto.AuthRequest;
import com.example.backend.dto.AuthResponse;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public AuthResponse register(AuthRequest request) {
        String normalizedUsername = request.getUsername() == null ? request.getEmail() : request.getUsername();
        String normalizedEmail = request.getEmail() == null ? request.getUsername() : request.getEmail();
        String normalizedFullName = request.getFullName() == null || request.getFullName().isBlank() ? normalizedUsername : request.getFullName();
        String requestedRole = request.getRole() == null ? "STUDENT" : request.getRole().trim().toUpperCase();

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role role;
        try {
            role = Role.valueOf(requestedRole);
        } catch (IllegalArgumentException ex) {
            role = Role.STUDENT;
        }

        User user = new User(
                normalizedUsername,
                passwordEncoder.encode(request.getPassword()),
                normalizedEmail,
                normalizedFullName,
                role
        );

        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Registration successful", user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        String usernameOrEmail = request.getUsername() == null || request.getUsername().isBlank()
                ? request.getEmail()
                : request.getUsername();

        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Login successful", user.getUsername(), user.getRole().name());
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
