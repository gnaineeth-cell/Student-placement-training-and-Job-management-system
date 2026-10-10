package com.example.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.AnnouncementDto;
import com.example.backend.model.Announcement;
import com.example.backend.model.Role;
import com.example.backend.repository.AnnouncementRepository;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<AnnouncementDto> getAll() {
        return announcementRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<AnnouncementDto> getByRole(Role role) {
        return announcementRepository.findByTargetRole(role).stream()
                .map(this::toDto)
                .toList();
    }

    public AnnouncementDto getById(Long id) {
        return toDto(getEntity(id));
    }

    public AnnouncementDto create(AnnouncementDto dto) {
        Announcement announcement = new Announcement(dto.getTitle(), dto.getMessage(), dto.getTargetRole());
        return toDto(announcementRepository.save(announcement));
    }

    public AnnouncementDto update(Long id, AnnouncementDto dto) {
        Announcement announcement = getEntity(id);
        announcement.setTitle(dto.getTitle());
        announcement.setMessage(dto.getMessage());
        announcement.setTargetRole(dto.getTargetRole());
        return toDto(announcementRepository.save(announcement));
    }

    public void delete(Long id) {
        announcementRepository.delete(getEntity(id));
    }

    private Announcement getEntity(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
    }

    private AnnouncementDto toDto(Announcement entity) {
        return new AnnouncementDto(
                entity.getId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getTargetRole(),
                entity.getCreatedAt());
    }
}
