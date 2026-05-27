package com.campuseventhub.certificate;

import com.campuseventhub.certificate.dto.CertificateResponse;
import com.campuseventhub.certificate.messaging.CertificateMessageConsumer;
import com.campuseventhub.certificate.service.CertificateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class CertificateServiceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CertificateService certificateService;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private CertificateMessageConsumer certificateMessageConsumer;

    private static Long createdCertId;
    private static String createdCertNumber;

    @Test
    @Order(1)
    void generateCertificate_success() {
        CertificateResponse response = certificateService.generateCertificate(
                2001L, "S001", "Alice Smith", 10L, "Tech Summit 2024"
        );

        assertThat(response.getId()).isNotNull();
        assertThat(response.getStudentId()).isEqualTo("S001");
        assertThat(response.getStudentName()).isEqualTo("Alice Smith");
        assertThat(response.getCertificateNumber()).startsWith("CERT-");
        assertThat(response.isHasPdf()).isTrue();

        createdCertId = response.getId();
        createdCertNumber = response.getCertificateNumber();
    }

    @Test
    @Order(2)
    void generateCertificate_idempotent() {
        CertificateResponse second = certificateService.generateCertificate(
                2001L, "S001", "Alice Smith", 10L, "Tech Summit 2024"
        );
        assertThat(second.getId()).isEqualTo(createdCertId);
        assertThat(second.getCertificateNumber()).isEqualTo(createdCertNumber);
    }

    @Test
    @Order(3)
    void getById_success() throws Exception {
        mockMvc.perform(get("/api/certificates/" + createdCertId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value("S001"))
                .andExpect(jsonPath("$.hasPdf").value(true));
    }

    @Test
    @Order(4)
    void getById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/certificates/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @Order(5)
    void getByNumber_success() throws Exception {
        mockMvc.perform(get("/api/certificates/number/" + createdCertNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.certificateNumber").value(createdCertNumber));
    }

    @Test
    @Order(6)
    void getByRegistrationId_success() throws Exception {
        mockMvc.perform(get("/api/certificates/registration/2001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrationId").value(2001));
    }

    @Test
    @Order(7)
    void getByStudent_success() throws Exception {
        mockMvc.perform(get("/api/certificates/student/S001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].studentId").value("S001"));
    }

    @Test
    @Order(8)
    void downloadPdf_success() throws Exception {
        mockMvc.perform(get("/api/certificates/" + createdCertId + "/pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"certificate-" + createdCertId + ".pdf\""));
    }

    @Test
    @Order(9)
    void generateSecondCertificate_differentRegistration() {
        CertificateResponse response = certificateService.generateCertificate(
                2002L, "S002", "Bob Jones", 10L, "Tech Summit 2024"
        );
        assertThat(response.getCertificateNumber()).isNotEqualTo(createdCertNumber);
        assertThat(response.isHasPdf()).isTrue();
    }

    @Test
    @Order(10)
    void getByStudent_empty() throws Exception {
        mockMvc.perform(get("/api/certificates/student/UNKNOWN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
