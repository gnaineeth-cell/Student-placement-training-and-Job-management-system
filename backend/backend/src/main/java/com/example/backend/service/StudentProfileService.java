package com.example.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.StudentProfileDto;
import com.example.backend.model.StudentProfile;
import com.example.backend.repository.StudentProfileRepository;

@Service
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;

    public StudentProfileService(StudentProfileRepository studentProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
    }

    public List<StudentProfileDto> getAll() {
        return studentProfileRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public StudentProfileDto getById(Long id) {
        return toDto(getEntity(id));
    }

    public StudentProfileDto create(StudentProfileDto dto) {
        StudentProfile entity = new StudentProfile(
                dto.getFullName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getBranch(),
                dto.getGraduationYear(),
                dto.getCgpa(),
                dto.getSkills(),
                dto.getResumeUrl());
        entity.setTenthPercentage(dto.getTenthPercentage());
        entity.setTwelfthPercentage(dto.getTwelfthPercentage());
        entity.setCurrentBacklogs(dto.getCurrentBacklogs() != null ? dto.getCurrentBacklogs() : 0);
        entity.setHistoryOfBacklogs(dto.getHistoryOfBacklogs() != null ? dto.getHistoryOfBacklogs() : 0);
        entity.setAttendancePercentage(dto.getAttendancePercentage());
        entity.setTrainingAttendancePercentage(dto.getTrainingAttendancePercentage());
        entity.setMockTestsPassed(dto.getMockTestsPassed() != null ? dto.getMockTestsPassed() : 0);
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "Approved");
        return toDto(studentProfileRepository.save(entity));
    }

    public StudentProfileDto update(Long id, StudentProfileDto dto) {
        StudentProfile entity = getEntity(id);
        entity.setFullName(dto.getFullName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setBranch(dto.getBranch());
        entity.setGraduationYear(dto.getGraduationYear());
        entity.setCgpa(dto.getCgpa());
        entity.setSkills(dto.getSkills());
        entity.setResumeUrl(dto.getResumeUrl());
        if (dto.getTenthPercentage() != null) entity.setTenthPercentage(dto.getTenthPercentage());
        if (dto.getTwelfthPercentage() != null) entity.setTwelfthPercentage(dto.getTwelfthPercentage());
        if (dto.getCurrentBacklogs() != null) entity.setCurrentBacklogs(dto.getCurrentBacklogs());
        if (dto.getHistoryOfBacklogs() != null) entity.setHistoryOfBacklogs(dto.getHistoryOfBacklogs());
        if (dto.getAttendancePercentage() != null) entity.setAttendancePercentage(dto.getAttendancePercentage());
        if (dto.getTrainingAttendancePercentage() != null) entity.setTrainingAttendancePercentage(dto.getTrainingAttendancePercentage());
        if (dto.getMockTestsPassed() != null) entity.setMockTestsPassed(dto.getMockTestsPassed());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return toDto(studentProfileRepository.save(entity));
    }

    public void delete(Long id) {
        studentProfileRepository.delete(getEntity(id));
    }

    private StudentProfile getEntity(Long id) {
        return studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));
    }

    private StudentProfileDto toDto(StudentProfile entity) {
        StudentProfileDto dto = new StudentProfileDto(
                entity.getId(),
                entity.getFullName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getBranch(),
                entity.getGraduationYear(),
                entity.getCgpa(),
                entity.getSkills(),
                entity.getResumeUrl());
        dto.setTenthPercentage(entity.getTenthPercentage());
        dto.setTwelfthPercentage(entity.getTwelfthPercentage());
        dto.setCurrentBacklogs(entity.getCurrentBacklogs());
        dto.setHistoryOfBacklogs(entity.getHistoryOfBacklogs());
        dto.setAttendancePercentage(entity.getAttendancePercentage());
        dto.setTrainingAttendancePercentage(entity.getTrainingAttendancePercentage());
        dto.setMockTestsPassed(entity.getMockTestsPassed());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus() : "Approved");
        return dto;
    }
}
