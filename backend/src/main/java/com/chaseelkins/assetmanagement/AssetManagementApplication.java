package com.chaseelkins.assetmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AssetManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(AssetManagementApplication.class, args);
        System.out.println("🚀 IT Asset Management System Started Successfully!");
        System.out.println("📊 Dashboard: http://localhost:8080/api/v1");
        System.out.println("🔧 H2 Console: http://localhost:8080/api/v1/h2-console");
    }
}