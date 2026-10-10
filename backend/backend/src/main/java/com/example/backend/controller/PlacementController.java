package com.example.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.AnnouncementDto;
import com.example.backend.dto.ApplicationDto;
import com.example.backend.dto.CompanyDto;
import com.example.backend.dto.JobPostingDto;
import com.example.backend.dto.StudentProfileDto;
import com.example.backend.dto.TrainingProgramDto;
import com.example.backend.model.ApplicationStatus;
import com.example.backend.model.Role;
import com.example.backend.service.AnnouncementService;
import com.example.backend.service.CompanyService;
import com.example.backend.service.JobApplicationService;
import com.example.backend.service.JobPostingService;
import com.example.backend.service.StudentProfileService;
import com.example.backend.service.TrainingProgramService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PlacementController {

    private final StudentProfileService studentProfileService;
    private final CompanyService companyService;
    private final JobPostingService jobPostingService;
    private final JobApplicationService jobApplicationService;
    private final TrainingProgramService trainingProgramService;
    private final AnnouncementService announcementService;

    public PlacementController(StudentProfileService studentProfileService,
                              CompanyService companyService,
                              JobPostingService jobPostingService,
                              JobApplicationService jobApplicationService,
                              TrainingProgramService trainingProgramService,
                              AnnouncementService announcementService) {
        this.studentProfileService = studentProfileService;
        this.companyService = companyService;
        this.jobPostingService = jobPostingService;
        this.jobApplicationService = jobApplicationService;
        this.trainingProgramService = trainingProgramService;
        this.announcementService = announcementService;
    }

    @GetMapping("/students")
    public List<StudentProfileDto> getStudents() {
        return studentProfileService.getAll();
    }

    @GetMapping("/students/{id}")
    public StudentProfileDto getStudent(@PathVariable Long id) {
        return studentProfileService.getById(id);
    }

    @PostMapping("/students")
    public ResponseEntity<StudentProfileDto> createStudent(@Valid @RequestBody StudentProfileDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentProfileService.create(dto));
    }

    @PutMapping("/students/{id}")
    public StudentProfileDto updateStudent(@PathVariable Long id, @Valid @RequestBody StudentProfileDto dto) {
        return studentProfileService.update(id, dto);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentProfileService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/companies")
    public List<CompanyDto> getCompanies() {
        return companyService.getAll();
    }

    @GetMapping("/companies/{id}")
    public CompanyDto getCompany(@PathVariable Long id) {
        return companyService.getById(id);
    }

    @PostMapping("/companies")
    public ResponseEntity<CompanyDto> createCompany(@Valid @RequestBody CompanyDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(dto));
    }

    @PutMapping("/companies/{id}")
    public CompanyDto updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyDto dto) {
        return companyService.update(id, dto);
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jobs")
    public List<JobPostingDto> getJobs() {
        return jobPostingService.getAll();
    }

    @GetMapping("/jobs/active")
    public List<JobPostingDto> getActiveJobs() {
        return jobPostingService.getActiveJobs();
    }

    @GetMapping("/jobs/{id}")
    public JobPostingDto getJob(@PathVariable Long id) {
        return jobPostingService.getById(id);
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobPostingDto> createJob(@Valid @RequestBody JobPostingDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobPostingService.create(dto));
    }

    @PutMapping("/jobs/{id}")
    public JobPostingDto updateJob(@PathVariable Long id, @Valid @RequestBody JobPostingDto dto) {
        return jobPostingService.update(id, dto);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobPostingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/applications")
    public List<ApplicationDto> getApplications() {
        return jobApplicationService.getAll();
    }

    @GetMapping("/applications/student/{studentId}")
    public List<ApplicationDto> getApplicationsByStudent(@PathVariable Long studentId) {
        return jobApplicationService.getByStudent(studentId);
    }

    @GetMapping("/applications/job/{jobId}")
    public List<ApplicationDto> getApplicationsByJob(@PathVariable Long jobId) {
        return jobApplicationService.getByJob(jobId);
    }

    @PostMapping("/applications")
    public ResponseEntity<ApplicationDto> apply(@RequestParam Long studentId, @RequestParam Long jobId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobApplicationService.apply(studentId, jobId));
    }

    @PutMapping("/applications/{id}/status")
    public ApplicationDto updateApplicationStatus(@PathVariable Long id, @RequestParam ApplicationStatus status) {
        return jobApplicationService.updateStatus(id, status);
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        jobApplicationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/training")
    public List<TrainingProgramDto> getTrainingPrograms() {
        return trainingProgramService.getAll();
    }

    @GetMapping("/training/active")
    public List<TrainingProgramDto> getActiveTrainingPrograms() {
        return trainingProgramService.getActivePrograms();
    }

    @PostMapping("/training")
    public ResponseEntity<TrainingProgramDto> createTrainingProgram(@Valid @RequestBody TrainingProgramDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainingProgramService.create(dto));
    }

    @PutMapping("/training/{id}")
    public TrainingProgramDto updateTrainingProgram(@PathVariable Long id, @Valid @RequestBody TrainingProgramDto dto) {
        return trainingProgramService.update(id, dto);
    }

    @DeleteMapping("/training/{id}")
    public ResponseEntity<Void> deleteTrainingProgram(@PathVariable Long id) {
        trainingProgramService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/announcements")
    public List<AnnouncementDto> getAnnouncements() {
        return announcementService.getAll();
    }

    @GetMapping("/announcements/role/{role}")
    public List<AnnouncementDto> getAnnouncementsByRole(@PathVariable Role role) {
        return announcementService.getByRole(role);
    }

    @PostMapping("/announcements")
    public ResponseEntity<AnnouncementDto> createAnnouncement(@Valid @RequestBody AnnouncementDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.create(dto));
    }

    @PutMapping("/announcements/{id}")
    public AnnouncementDto updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementDto dto) {
        return announcementService.update(id, dto);
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
