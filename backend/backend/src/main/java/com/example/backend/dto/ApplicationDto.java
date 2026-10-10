package com.example.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.backend.model.ApplicationStatus;

public class ApplicationDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String branch;
    private Integer graduationYear;
    private Double cgpa;
    private Long jobId;
    private String jobTitle;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDate applicationDeadline;

    public ApplicationDto() {
    }

    public ApplicationDto(Long id, Long studentId, String studentName, String branch,
                          Integer graduationYear, Double cgpa, Long jobId, String jobTitle,
                          ApplicationStatus status, LocalDateTime appliedAt) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.branch = branch;
        this.graduationYear = graduationYear;
        this.cgpa = cgpa;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    public ApplicationDto(Long id, Long studentId, String studentName, Long jobId, String jobTitle,
                          ApplicationStatus status, LocalDateTime appliedAt) {
        this(id, studentId, studentName, null, null, null, jobId, jobTitle, status, appliedAt);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }
}
