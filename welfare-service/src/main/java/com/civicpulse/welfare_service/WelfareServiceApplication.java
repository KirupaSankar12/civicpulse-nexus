package com.civicpulse.welfare_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class WelfareServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(WelfareServiceApplication.class, args);
    }
}
