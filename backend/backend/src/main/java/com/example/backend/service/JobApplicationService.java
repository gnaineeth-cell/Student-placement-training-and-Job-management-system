package com.example.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.ApplicationDto;
import com.example.backend.model.ApplicationStatus;
import com.example.backend.model.JobApplication;
import com.example.backend.model.JobPosting;
import com.example.backend.model.StudentProfile;
import com.example.backend.repository.JobApplicationRepository;
import com.example.backend.repository.JobPostingRepository;
import com.example.backend.repository.StudentProfileRepository;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JobPostingRepository jobPostingRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
                                 StudentProfileRepository studentProfileRepository,
                                 JobPostingRepository jobPostingRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jobPostingRepository = jobPostingRepository;
    }

    public List<ApplicationDto> getAll() {
        return jobApplicationRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<ApplicationDto> getByStudent(Long studentId) {
        return jobApplicationRepository.findByStudentId(studentId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ApplicationDto> getByJob(Long jobId) {
        return jobApplicationRepository.findByJobPostingId(jobId).stream()
                .map(this::toDto)
                .toList();
    }

    public ApplicationDto apply(Long studentId, Long jobId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));
        JobPosting jobPosting = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job posting not found"));

        // Institutional placement eligibility checks
        if ("Debarred".equalsIgnoreCase(student.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate is Debarred from campus placement drives by the administrator");
        }
        if (!"Approved".equalsIgnoreCase(student.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate status must be Approved to participate in campus recruitment");
        }
        if (jobPosting.getApplicationDeadline() != null && java.time.LocalDate.now().isAfter(jobPosting.getApplicationDeadline())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job application deadline (" + jobPosting.getApplicationDeadline() + ") has expired");
        }
        if (student.getCgpa() != null && student.getCgpa() < 6.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum 6.0 CGPA required for placement drives (current: " + student.getCgpa() + ")");
        }
        if (student.getCurrentBacklogs() != null && student.getCurrentBacklogs() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current active backlogs (" + student.getCurrentBacklogs() + ") exceed placement threshold (0)");
        }
        if (student.getAttendancePercentage() != null && student.getAttendancePercentage() < 75.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Academic attendance (" + student.getAttendancePercentage() + "%) is below required minimum (75%)");
        }
        if (student.getResumeUrl() == null || student.getResumeUrl().trim().isEmpty() || "#".equals(student.getResumeUrl().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume must be uploaded and profile complete before submitting job applications");
        }

        JobApplication application = new JobApplication(student, jobPosting, ApplicationStatus.APPLIED);
        return toDto(jobApplicationRepository.save(application));
    }

    public ApplicationDto updateStatus(Long applicationId, ApplicationStatus status) {
        JobApplication application = getEntity(applicationId);
        application.setStatus(status);
        if (status == ApplicationStatus.REJECTED) {
            String studentEmail = application.getStudent() != null ? application.getStudent().getEmail() : "student@example.com";
            String studentName = application.getStudent() != null ? application.getStudent().getFullName() : "Candidate";
            String jobTitle = application.getJobPosting() != null ? application.getJobPosting().getTitle() : "Role";
            String companyName = application.getJobPosting() != null && application.getJobPosting().getCompany() != null
                    ? application.getJobPosting().getCompany().getName()
                    : "Corporate Partner";
            System.out.println("[EMAIL NOTIFICATION DISPATCHED] Official Rejection Email sent to candidate " + studentEmail +
                    " (" + studentName + ") for role: " + jobTitle + " at " + companyName);
        }
        return toDto(jobApplicationRepository.save(application));
    }

    public void delete(Long id) {
        jobApplicationRepository.delete(getEntity(id));
    }

    private JobApplication getEntity(Long id) {
        return jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    private ApplicationDto toDto(JobApplication entity) {
        ApplicationDto dto = new ApplicationDto(
                entity.getId(),
                entity.getStudent() != null ? entity.getStudent().getId() : null,
                entity.getStudent() != null ? entity.getStudent().getFullName() : null,
                entity.getStudent() != null ? entity.getStudent().getBranch() : null,
                entity.getStudent() != null ? entity.getStudent().getGraduationYear() : null,
                entity.getStudent() != null ? entity.getStudent().getCgpa() : null,
                entity.getJobPosting() != null ? entity.getJobPosting().getId() : null,
                entity.getJobPosting() != null ? entity.getJobPosting().getTitle() : null,
                entity.getStatus(),
                entity.getAppliedAt());
        if (entity.getJobPosting() != null) {
            dto.setApplicationDeadline(entity.getJobPosting().getApplicationDeadline());
        }
        return dto;
    }
}
