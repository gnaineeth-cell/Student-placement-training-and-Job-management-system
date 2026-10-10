package com.example.backend.dto;

import java.time.LocalDateTime;

public class InterviewScheduleDto {
    private Long id;
    private Long applicationId;
    private String roundName;
    private String interviewerName;
    private String interviewType;
    private LocalDateTime scheduledAt;
    private String location;
    private String notes;
    private String result;

    public InterviewScheduleDto() {
    }

    public InterviewScheduleDto(Long id, Long applicationId, String roundName, String interviewerName,
                               String interviewType, LocalDateTime scheduledAt, String location,
                               String notes, String result) {
        this.id = id;
        this.applicationId = applicationId;
        this.roundName = roundName;
        this.interviewerName = interviewerName;
        this.interviewType = interviewType;
        this.scheduledAt = scheduledAt;
        this.location = location;
        this.notes = notes;
        this.result = result;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }
    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }
    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
}
