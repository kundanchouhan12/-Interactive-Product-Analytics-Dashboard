package com.analytics.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature_click")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK -> user table
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "feature_name")
    private String featureName;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}
