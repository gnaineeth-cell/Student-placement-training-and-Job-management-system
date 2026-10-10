package com.example.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.TrainingProgramDto;
import com.example.backend.model.TrainingProgram;
import com.example.backend.repository.TrainingProgramRepository;

@Service
public class TrainingProgramService {

    private final TrainingProgramRepository trainingProgramRepository;

    public TrainingProgramService(TrainingProgramRepository trainingProgramRepository) {
        this.trainingProgramRepository = trainingProgramRepository;
    }

    public List<TrainingProgramDto> getAll() {
        return trainingProgramRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<TrainingProgramDto> getActivePrograms() {
        return trainingProgramRepository.findByStatus("ACTIVE").stream()
                .map(this::toDto)
                .toList();
    }

    public TrainingProgramDto getById(Long id) {
        return toDto(getEntity(id));
    }

    public TrainingProgramDto create(TrainingProgramDto dto) {
        TrainingProgram program = new TrainingProgram(
                dto.getTitle(),
                dto.getTrainerName(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getCapacity(),
                dto.getStatus(),
                dto.getDescription());
        return toDto(trainingProgramRepository.save(program));
    }

    public TrainingProgramDto update(Long id, TrainingProgramDto dto) {
        TrainingProgram program = getEntity(id);
        program.setTitle(dto.getTitle());
        program.setTrainerName(dto.getTrainerName());
        program.setStartDate(dto.getStartDate());
        program.setEndDate(dto.getEndDate());
        program.setCapacity(dto.getCapacity());
        program.setStatus(dto.getStatus());
        program.setDescription(dto.getDescription());
        return toDto(trainingProgramRepository.save(program));
    }

    public void delete(Long id) {
        trainingProgramRepository.delete(getEntity(id));
    }

    private TrainingProgram getEntity(Long id) {
        return trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Training program not found"));
    }

    private TrainingProgramDto toDto(TrainingProgram entity) {
        return new TrainingProgramDto(
                entity.getId(),
                entity.getTitle(),
                entity.getTrainerName(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getCapacity(),
                entity.getStatus(),
                entity.getDescription());
    }
}
