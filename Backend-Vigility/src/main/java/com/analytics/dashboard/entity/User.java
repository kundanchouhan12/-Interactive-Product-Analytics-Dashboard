package com.analytics.dashboard.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name = "users_info")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String password;

    private Integer age;

    private String gender;
}
