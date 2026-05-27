package com.campuseventhub.certificate.messaging;

import com.campuseventhub.certificate.config.RabbitMQConfig;
import com.campuseventhub.certificate.service.CertificateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CertificateMessageConsumer {

    private final CertificateService certificateService;

    @RabbitListener(queues = RabbitMQConfig.CERTIFICATE_QUEUE)
    public void handleAttendanceCompleted(AttendanceCompletedEvent event) {
        log.info("Received attendance.completed for registrationId={}", event.getRegistrationId());
        certificateService.generateCertificate(
                event.getRegistrationId(),
                event.getStudentId(),
                event.getStudentName(),
                event.getEventId(),
                event.getEventTitle()
        );
    }
}
