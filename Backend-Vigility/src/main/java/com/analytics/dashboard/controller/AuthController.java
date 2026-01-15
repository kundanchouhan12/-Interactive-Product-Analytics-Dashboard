package com.analytics.dashboard.controller;

import com.analytics.dashboard.entity.User;
import com.analytics.dashboard.repository.UserRepository;
import com.analytics.dashboard.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user){
        if(userRepo.findByUsername(user.getUsername()).isPresent())
            return ResponseEntity.badRequest().body("Username exists");

        user.setPassword(encoder.encode(user.getPassword()));
        User savedUser = userRepo.save(user);

        // Return token & userId immediately (optional)
        String token = jwtUtil.generateToken(savedUser.getUsername());
        return ResponseEntity.ok(Map.of(
                "message", "User registered",
                "token", token,
                "userId", savedUser.getId()
        ));
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user){
        User dbUser = userRepo.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(!encoder.matches(user.getPassword(), dbUser.getPassword()))
            return ResponseEntity.badRequest().body("Invalid password");
        String token = jwtUtil.generateToken(dbUser.getUsername());
        return ResponseEntity.ok(Map.of("token", token, "userId", dbUser.getId()));
    }
}
