package com.example.backend.dto;

import java.time.LocalDate;

public class JobPostingDto {
    private Long id;
    private String title;
    private Long companyId;
    private String companyName;
    private String location;
    private String jobType;
    private String description;
    private String skillsRequired;
    private String salaryRange;
    private LocalDate postedDate;
    private LocalDate applicationDeadline;
    private boolean active;

    public JobPostingDto() {
    }

    public JobPostingDto(Long id, String title, Long companyId, String companyName, String location,
                        String jobType, String description, String skillsRequired,
                        String salaryRange, LocalDate postedDate, boolean active) {
        this.id = id;
        this.title = title;
        this.companyId = companyId;
        this.companyName = companyName;
        this.location = location;
        this.jobType = jobType;
        this.description = description;
        this.skillsRequired = skillsRequired;
        this.salaryRange = salaryRange;
        this.postedDate = postedDate;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(String skillsRequired) { this.skillsRequired = skillsRequired; }
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public LocalDate getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDate postedDate) { this.postedDate = postedDate; }
    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
