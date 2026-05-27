package com.campuseventhub.attendance;

import com.campuseventhub.attendance.client.ExistsResponse;
import com.campuseventhub.attendance.client.RegistrationClient;
import com.campuseventhub.attendance.dto.AttendanceRequest;
import com.campuseventhub.attendance.dto.AttendanceResponse;
import com.campuseventhub.attendance.dto.AttendanceStatusResponse;
import com.campuseventhub.attendance.messaging.AttendanceEventPublisher;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AttendanceServiceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RegistrationClient registrationClient;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private AttendanceEventPublisher eventPublisher;

    private static Long createdAttendanceId;

    private AttendanceRequest buildRequest() {
        return AttendanceRequest.builder()
                .registrationId(1001L)
                .studentId("S001")
                .studentName("Alice Smith")
                .studentEmail("alice@example.com")
                .eventId(10L)
                .eventTitle("Tech Summit 2024")
                .build();
    }

    @Test
    @Order(1)
    void markAttendance_success() throws Exception {
        when(registrationClient.checkExists(1001L)).thenReturn(new ExistsResponse(true));
        doNothing().when(eventPublisher).publishAttendanceCompleted(any());

        String body = mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value("S001"))
                .andExpect(jsonPath("$.status").value("PRESENT"))
                .andReturn().getResponse().getContentAsString();

        AttendanceResponse response = objectMapper.readValue(body, AttendanceResponse.class);
        createdAttendanceId = response.getId();
    }

    @Test
    @Order(2)
    void markAttendance_duplicate_returns409() throws Exception {
        when(registrationClient.checkExists(1001L)).thenReturn(new ExistsResponse(true));

        mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    @Order(3)
    void markAttendance_registrationNotFound_returns404() throws Exception {
        when(registrationClient.checkExists(9999L)).thenReturn(new ExistsResponse(false));

        AttendanceRequest req = AttendanceRequest.builder()
                .registrationId(9999L)
                .studentId("S002")
                .eventId(10L)
                .build();

        mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(4)
    void markAttendance_missingFields_returns400() throws Exception {
        AttendanceRequest req = AttendanceRequest.builder().build();

        mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    @Order(5)
    void getById_success() throws Exception {
        mockMvc.perform(get("/api/attendance/" + createdAttendanceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value("S001"));
    }

    @Test
    @Order(6)
    void getById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/attendance/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(7)
    void getStatus_present() throws Exception {
        mockMvc.perform(get("/api/attendance/1001/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.present").value(true))
                .andExpect(jsonPath("$.markedAt").exists());
    }

    @Test
    @Order(8)
    void getStatus_absent() throws Exception {
        mockMvc.perform(get("/api/attendance/8888/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.present").value(false));
    }

    @Test
    @Order(9)
    void getByEvent_success() throws Exception {
        mockMvc.perform(get("/api/attendance/event/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].eventId").value(10));
    }

    @Test
    @Order(10)
    void getByStudent_success() throws Exception {
        mockMvc.perform(get("/api/attendance/student/S001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].studentId").value("S001"));
    }

    @Test
    @Order(11)
    void markAttendance_differentRegistration_success() throws Exception {
        when(registrationClient.checkExists(1002L)).thenReturn(new ExistsResponse(true));
        doNothing().when(eventPublisher).publishAttendanceCompleted(any());

        AttendanceRequest req = AttendanceRequest.builder()
                .registrationId(1002L)
                .studentId("S002")
                .studentName("Bob Jones")
                .studentEmail("bob@example.com")
                .eventId(10L)
                .eventTitle("Tech Summit 2024")
                .build();

        mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value("S002"));
    }

    @Test
    @Order(12)
    void getByEvent_multipleAttendees() throws Exception {
        mockMvc.perform(get("/api/attendance/event/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
