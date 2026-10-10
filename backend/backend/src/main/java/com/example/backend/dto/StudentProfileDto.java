package com.example.backend.dto;

public class StudentProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String branch;
    private Integer graduationYear;
    private Double cgpa;
    private Double tenthPercentage;
    private Double twelfthPercentage;
    private Integer currentBacklogs;
    private Integer historyOfBacklogs;
    private Double attendancePercentage;
    private Double trainingAttendancePercentage;
    private Integer mockTestsPassed;
    private String status;
    private String skills;
    private String resumeUrl;

    public StudentProfileDto() {
    }

    public StudentProfileDto(Long id, String fullName, String email, String phone, String branch,
                           Integer graduationYear, Double cgpa, String skills, String resumeUrl) {
        this.id = id;
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
