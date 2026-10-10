package com.example.backend.dto;

import java.time.LocalDateTime;

import com.example.backend.model.Role;

public class AnnouncementDto {
    private Long id;
    private String title;
    private String message;
    private Role targetRole;
    private LocalDateTime createdAt;

    public AnnouncementDto() {
    }

    public AnnouncementDto(Long id, String title, String message, Role targetRole, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.targetRole = targetRole;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Role getTargetRole() { return targetRole; }
    public void setTargetRole(Role targetRole) { this.targetRole = targetRole; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
