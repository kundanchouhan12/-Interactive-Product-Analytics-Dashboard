package com.analytics.dashboard.repository;

import com.analytics.dashboard.entity.FeatureClick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeatureClickRepository extends JpaRepository<FeatureClick, Long> {

    // -------- Aggregate for Bar Chart (with filters) --------
    @Query(value = """
        SELECT f.feature_name, COUNT(*)
        FROM feature_click f
        JOIN users_info u ON f.user_id = u.id
        WHERE f.timestamp BETWEEN :start AND :end
          AND (
               :age IS NULL OR
               (:age = '<18' AND u.age < 18) OR
               (:age = '18-40' AND u.age BETWEEN 18 AND 40) OR
               (:age = '>40' AND u.age > 40)
          )
          AND (:gender IS NULL OR u.gender = :gender)
        GROUP BY f.feature_name
    """, nativeQuery = true)
    List<Object[]> aggregateFeatureClicksWithFilters(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("age") String age,
            @Param("gender") String gender
    );

    // -------- Aggregate for Line Chart (feature vs date) --------
    @Query(value = """
        SELECT f.feature_name, DATE(f.timestamp) AS date, COUNT(*)
        FROM feature_click f
        JOIN users_info u ON f.user_id = u.id
        WHERE f.timestamp BETWEEN :start AND :end
          AND (
               :age IS NULL OR
               (:age = '<18' AND u.age < 18) OR
               (:age = '18-40' AND u.age BETWEEN 18 AND 40) OR
               (:age = '>40' AND u.age > 40)
          )
          AND (:gender IS NULL OR u.gender = :gender)
        GROUP BY f.feature_name, DATE(f.timestamp)
        ORDER BY DATE(f.timestamp)
    """, nativeQuery = true)
    List<Object[]> aggregateFeatureClicksByDateWithFilters(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("age") String age,
            @Param("gender") String gender
    );
}
