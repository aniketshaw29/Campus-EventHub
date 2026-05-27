package com.campuseventhub.certificate.repository;

import com.campuseventhub.certificate.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByStudentId(String studentId);
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    Optional<Certificate> findByRegistrationId(Long registrationId);
    boolean existsByRegistrationId(Long registrationId);
}
