package com.campuseventhub.attendance.service;

import com.campuseventhub.attendance.client.RegistrationClient;
import com.campuseventhub.attendance.dto.AttendanceRequest;
import com.campuseventhub.attendance.dto.AttendanceResponse;
import com.campuseventhub.attendance.dto.AttendanceStatusResponse;
import com.campuseventhub.attendance.entity.Attendance;
import com.campuseventhub.attendance.entity.AttendanceStatus;
import com.campuseventhub.attendance.exception.AttendanceAlreadyMarkedException;
import com.campuseventhub.attendance.exception.AttendanceNotFoundException;
import com.campuseventhub.attendance.exception.RegistrationServiceUnavailableException;
import com.campuseventhub.attendance.messaging.AttendanceCompletedEvent;
import com.campuseventhub.attendance.messaging.AttendanceEventPublisher;
import com.campuseventhub.attendance.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final RegistrationClient registrationClient;
    private final AttendanceEventPublisher eventPublisher;

    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request) {
        if (attendanceRepository.existsByRegistrationId(request.getRegistrationId())) {
            throw new AttendanceAlreadyMarkedException(request.getRegistrationId());
        }

        var existsResponse = registrationClient.checkExists(request.getRegistrationId());
        if (!existsResponse.isExists()) {
            throw new AttendanceNotFoundException("Registration not found: " + request.getRegistrationId());
        }

        Attendance attendance = Attendance.builder()
                .registrationId(request.getRegistrationId())
                .studentId(request.getStudentId())
                .studentName(request.getStudentName())
                .studentEmail(request.getStudentEmail())
                .eventId(request.getEventId())
                .eventTitle(request.getEventTitle())
                .markedAt(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        attendance = attendanceRepository.save(attendance);

        eventPublisher.publishAttendanceCompleted(AttendanceCompletedEvent.builder()
                .attendanceId(attendance.getId())
                .registrationId(attendance.getRegistrationId())
                .studentId(attendance.getStudentId())
                .studentName(attendance.getStudentName())
                .studentEmail(attendance.getStudentEmail())
                .eventId(attendance.getEventId())
                .eventTitle(attendance.getEventTitle())
                .markedAt(attendance.getMarkedAt())
                .build());

        return toResponse(attendance);
    }

    public AttendanceResponse getAttendanceById(Long id) {
        return attendanceRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new AttendanceNotFoundException("Attendance not found: " + id));
    }

    public AttendanceStatusResponse getStatusByRegistrationId(Long registrationId) {
        return attendanceRepository.findByRegistrationId(registrationId)
                .map(a -> new AttendanceStatusResponse(true, a.getMarkedAt()))
                .orElse(new AttendanceStatusResponse(false, null));
    }

    public List<AttendanceResponse> getAttendanceByEvent(Long eventId) {
        return attendanceRepository.findByEventId(eventId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByStudent(String studentId) {
        return attendanceRepository.findByStudentId(studentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .registrationId(a.getRegistrationId())
                .studentId(a.getStudentId())
                .studentName(a.getStudentName())
                .studentEmail(a.getStudentEmail())
                .eventId(a.getEventId())
                .eventTitle(a.getEventTitle())
                .markedAt(a.getMarkedAt())
                .status(a.getStatus().name())
                .build();
    }
}
