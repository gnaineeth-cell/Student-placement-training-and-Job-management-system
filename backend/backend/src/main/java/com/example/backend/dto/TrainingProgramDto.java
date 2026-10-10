package com.example.backend.dto;

import java.time.LocalDate;

public class TrainingProgramDto {
    private Long id;
    private String title;
    private String trainerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
    private String status;
    private String description;

    public TrainingProgramDto() {
    }

    public TrainingProgramDto(Long id, String title, String trainerName, LocalDate startDate,
                            LocalDate endDate, Integer capacity, String status, String description) {
        this.id = id;
        this.title = title;
        this.trainerName = trainerName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.capacity = capacity;
        this.status = status;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTrainerName() { return trainerName; }
    public void setTrainerName(String trainerName) { this.trainerName = trainerName; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
