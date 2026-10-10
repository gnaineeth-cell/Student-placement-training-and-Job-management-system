package com.example.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "interview_schedules")
public class InterviewSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(nullable = false)
    private String roundName;

    @Column(nullable = false)
    private String interviewerName;

    @Column(nullable = false)
    private String interviewType;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private String location;

    @Column(length = 2000)
    private String notes;

    private String result;

    public InterviewSchedule() {
    }

    public InterviewSchedule(JobApplication application, String roundName, String interviewerName,
                            String interviewType, LocalDateTime scheduledAt, String location, String notes, String result) {
        this.application = application;
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
    public JobApplication getApplication() { return application; }
    public void setApplication(JobApplication application) { this.application = application; }
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
