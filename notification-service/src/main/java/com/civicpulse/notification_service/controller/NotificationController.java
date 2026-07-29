package com.civicpulse.notification_service.controller;

import com.civicpulse.notification_service.entity.Notification;
import com.civicpulse.notification_service.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/recipient/{recipient}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String recipient) {
        try {
            if (recipient == null || recipient.isBlank()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            List<Notification> list = notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient);
            return ResponseEntity.ok(list != null ? list : Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable UUID id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setReadStatus(true);
                    return ResponseEntity.ok(notificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
