package com.analytics.dashboard.controller;

import com.analytics.dashboard.entity.FeatureClick;
import com.analytics.dashboard.entity.User;
import com.analytics.dashboard.repository.FeatureClickRepository;
import com.analytics.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/track")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TrackController {

    private final FeatureClickRepository clickRepo;
    private final UserRepository userRepo;

    @PostMapping
    public ResponseEntity<?> trackFeature(@RequestBody TrackRequest request) {
        // Fetch user from DB
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        FeatureClick click = FeatureClick.builder()
                .user(user)
                .featureName(request.getFeatureName())
                .timestamp(LocalDateTime.now())
                .build();

        FeatureClick savedClick = clickRepo.save(click);

        return ResponseEntity.ok(savedClick);
    }

    // DTO for request
    public static class TrackRequest {
        private Long userId;
        private String featureName;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getFeatureName() { return featureName; }
        public void setFeatureName(String featureName) { this.featureName = featureName; }
    }
}
