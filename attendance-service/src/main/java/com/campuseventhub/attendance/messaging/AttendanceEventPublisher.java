package com.campuseventhub.attendance.messaging;

import com.campuseventhub.attendance.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AttendanceEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishAttendanceCompleted(AttendanceCompletedEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, event);
    }
}
