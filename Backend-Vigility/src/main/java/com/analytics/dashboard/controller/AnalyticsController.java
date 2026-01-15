package com.analytics.dashboard.controller;

import com.analytics.dashboard.repository.FeatureClickRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins ="https://gregarious-crepe-77d5d2.netlify.app", allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private FeatureClickRepository repository;

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) String age,
            @RequestParam(required = false) String gender
    ) {

        // Start and End as LocalDateTime
        LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);

        // Fetch Bar Data
        List<Object[]> barRows = repository.aggregateFeatureClicksWithFilters(start, end, age, gender);
        Map<String, Integer> barData = new HashMap<>();
        for (Object[] row : barRows) {
            String feature = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            barData.put(feature, count.intValue());
        }

        // Fetch Line Data
        List<Object[]> lineRows = repository.aggregateFeatureClicksByDateWithFilters(start, end, age, gender);
        Map<String, List<Map<String, Object>>> lineData = new HashMap<>();
        for (Object[] row : lineRows) {
            String feature = (String) row[0];

            // PostgreSQL DATE() returns java.time.LocalDate
            LocalDate date = (LocalDate) row[1];

            Long count = ((Number) row[2]).longValue();
            Map<String, Object> point = new HashMap<>();
            point.put("date", date.toString());
            point.put("count", count.intValue());

            lineData.computeIfAbsent(feature, k -> new ArrayList<>()).add(point);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("barData", barData);
        response.put("lineData", lineData);

        return response;
    }
}
