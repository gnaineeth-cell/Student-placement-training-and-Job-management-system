package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String branch;

    @Column(nullable = false)
    private Integer graduationYear;

    private Double cgpa;

    private Double tenthPercentage;

    private Double twelfthPercentage;

    private Integer currentBacklogs = 0;

    private Integer historyOfBacklogs = 0;

    private Double attendancePercentage;

    private Double trainingAttendancePercentage;

    private Integer mockTestsPassed = 0;

    @Column(nullable = false)
    private String status = "Approved";

    @Column(length = 1000)
    private String skills;

    private String resumeUrl;

    public StudentProfile() {
    }

    public StudentProfile(String fullName, String email, String phone, String branch,
                         Integer graduationYear, Double cgpa, String skills, String resumeUrl) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.branch = branch;
        this.graduationYear = graduationYear;
        this.cgpa = cgpa;
        this.skills = skills;
        this.resumeUrl = resumeUrl;
        this.status = "Approved";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public Double getTenthPercentage() { return tenthPercentage; }
    public void setTenthPercentage(Double tenthPercentage) { this.tenthPercentage = tenthPercentage; }
    public Double getTwelfthPercentage() { return twelfthPercentage; }
    public void setTwelfthPercentage(Double twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }
    public Integer getCurrentBacklogs() { return currentBacklogs; }
    public void setCurrentBacklogs(Integer currentBacklogs) { this.currentBacklogs = currentBacklogs; }
    public Integer getHistoryOfBacklogs() { return historyOfBacklogs; }
    public void setHistoryOfBacklogs(Integer historyOfBacklogs) { this.historyOfBacklogs = historyOfBacklogs; }
    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public Double getTrainingAttendancePercentage() { return trainingAttendancePercentage; }
    public void setTrainingAttendancePercentage(Double trainingAttendancePercentage) { this.trainingAttendancePercentage = trainingAttendancePercentage; }
    public Integer getMockTestsPassed() { return mockTestsPassed; }
    public void setMockTestsPassed(Integer mockTestsPassed) { this.mockTestsPassed = mockTestsPassed; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
}
