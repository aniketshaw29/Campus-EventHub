package com.campuseventhub.attendance.repository;

import com.campuseventhub.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEventId(Long eventId);
    List<Attendance> findByStudentId(String studentId);
    Optional<Attendance> findByRegistrationId(Long registrationId);
    boolean existsByRegistrationId(Long registrationId);
}
