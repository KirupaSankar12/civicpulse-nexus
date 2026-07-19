package com.civicpulse.servicemanagement.util;

import com.civicpulse.servicemanagement.repository.ApplicationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import java.time.Year;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ApplicationNumberGenerator {
    private final AtomicLong counter = new AtomicLong(1);
    private final ApplicationRepository repository;

    public ApplicationNumberGenerator(ApplicationRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void init() {
        long count = repository.count();
        if (count > 0) {
            counter.set(count + 1);
        }
    }

    public String generate() {
        int year = Year.now().getValue();
        long seq = counter.getAndIncrement();
        return String.format("APP-%d-%04d", year, seq);
    }
}
