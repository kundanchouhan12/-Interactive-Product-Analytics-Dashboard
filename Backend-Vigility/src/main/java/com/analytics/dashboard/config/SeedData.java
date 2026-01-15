// src/main/java/com/analytics/dashboard/config/SeedData.java
package com.analytics.dashboard.config;

import com.analytics.dashboard.entity.User;
import com.analytics.dashboard.entity.FeatureClick;
import com.analytics.dashboard.repository.UserRepository;
import com.analytics.dashboard.repository.FeatureClickRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Random;

@Component
public class SeedData implements CommandLineRunner {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private FeatureClickRepository clickRepo;

    @Override
    public void run(String... args) throws Exception {

        if(userRepo.count() > 0) return; // Skip if already seeded

        // --- Seed Users ---
        String[] genders = {"Male", "Female", "Other"};
        for(int i=1; i<=10; i++){
            User u = new User();
            u.setUsername("user"+i);
            u.setPassword("password"); // plain for dev
            u.setAge(15 + new Random().nextInt(50));
            u.setGender(genders[new Random().nextInt(3)]);
            userRepo.save(u);
        }

        // --- Seed Feature Clicks ---
        String[] features = {"date_filter","gender_filter","bar_chart_zoom","line_chart_select","example_feature"};
        for(User u : userRepo.findAll()){
            for(int j=0; j<10; j++){
                FeatureClick fc = new FeatureClick();
                fc.setUser(u);
                fc.setFeatureName(features[new Random().nextInt(features.length)]);
                fc.setTimestamp(LocalDateTime.now().minusDays(new Random().nextInt(30)));
                clickRepo.save(fc);
            }
        }

        System.out.println("Seeded dummy users & clicks!");
    }
}
