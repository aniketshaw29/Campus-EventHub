package com.campuseventhub.notification.messaging;

import com.campuseventhub.notification.config.RabbitMQConfig;
import com.campuseventhub.notification.entity.NotificationType;
import com.campuseventhub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationMessageConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleMessage(Map<String, Object> payload,
                              @Header(AmqpHeaders.RECEIVED_ROUTING_KEY) String routingKey) {
        log.info("Received message routingKey={}", routingKey);
        switch (routingKey) {
            case "registration.completed" -> handleRegistration(payload);
            case "announcement.created"   -> handleAnnouncement(payload);
            case "results.published"      -> handleResults(payload);
            default -> log.warn("Unknown routing key: {}", routingKey);
        }
    }

    private void handleRegistration(Map<String, Object> payload) {
        String studentId    = str(payload, "studentId");
        String studentEmail = str(payload, "studentEmail");
        String eventTitle   = str(payload, "eventTitle");
        notificationService.save(
                studentId, studentEmail,
                NotificationType.REGISTRATION,
                "Registration Confirmed: " + eventTitle,
                "You have successfully registered for " + eventTitle + "."
        );
    }

    private void handleAnnouncement(Map<String, Object> payload) {
        String title   = str(payload, "title");
        String content = str(payload, "content");
        notificationService.save(
                null, null,
                NotificationType.ANNOUNCEMENT,
                title, content
        );
    }

    private void handleResults(Map<String, Object> payload) {
        String eventTitle = str(payload, "eventTitle");
        notificationService.save(
                null, null,
                NotificationType.RESULT,
                "Results Published: " + eventTitle,
                "Results for " + eventTitle + " are now available."
        );
    }

    private String str(Map<String, Object> payload, String key) {
        Object val = payload.get(key);
        return val != null ? val.toString() : "";
    }
}
