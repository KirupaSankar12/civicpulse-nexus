package com.civicpulse.notification_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID notificationId;

    private String recipient; // citizenId or officer username
    private String eventType;
    private String message;
    private UUID complaintId;
    private boolean readStatus;
    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(String recipient, String eventType, String message, UUID complaintId, boolean readStatus, LocalDateTime createdAt) {
        this.recipient = recipient;
        this.eventType = eventType;
        this.message = message;
        this.complaintId = complaintId;
        this.readStatus = readStatus;
        this.createdAt = createdAt;
    }

    public UUID getNotificationId() { return notificationId; }
    public void setNotificationId(UUID notificationId) { this.notificationId = notificationId; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UUID getComplaintId() { return complaintId; }
    public void setComplaintId(UUID complaintId) { this.complaintId = complaintId; }

    public boolean isReadStatus() { return readStatus; }
    public void setReadStatus(boolean readStatus) { this.readStatus = readStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
