package com.civicpulse.notification_service.consumer;

import com.civicpulse.notification_service.dto.NotificationEvent;
import com.civicpulse.notification_service.entity.Notification;
import com.civicpulse.notification_service.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public NotificationConsumer(NotificationRepository notificationRepository, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "complaint-notifications", groupId = "notification-group")
    public void consumeNotification(String message) {
        try {
            System.out.println("Consumed Kafka event: " + message);
            NotificationEvent event = objectMapper.readValue(message, NotificationEvent.class);
            
            // Save to DB
            Notification notification = new Notification(
                    event.getRecipient(),
                    event.getEventType(),
                    event.getMessage(),
                    event.getComplaintId(),
                    false, // unread by default
                    LocalDateTime.now()
            );
            
            notificationRepository.save(notification);
            System.out.println("Saved notification to DB for recipient: " + event.getRecipient());
        } catch (Exception e) {
            System.err.println("Failed to process consumed Kafka event: " + e.getMessage());
        }
    }
}
