package com.example.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.JobPostingDto;
import com.example.backend.model.Company;
import com.example.backend.model.JobPosting;
import com.example.backend.repository.CompanyRepository;
import com.example.backend.repository.JobPostingRepository;

@Service
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    public JobPostingService(JobPostingRepository jobPostingRepository, CompanyRepository companyRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.companyRepository = companyRepository;
    }

    public List<JobPostingDto> getAll() {
        return jobPostingRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<JobPostingDto> getActiveJobs() {
        return jobPostingRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .toList();
    }

    public JobPostingDto getById(Long id) {
        return toDto(getEntity(id));
    }

    public List<JobPostingDto> getByCompany(Long companyId) {
        return jobPostingRepository.findByCompanyId(companyId).stream()
                .map(this::toDto)
                .toList();
    }

    public JobPostingDto create(JobPostingDto dto) {
        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId()).orElse(null);
        }
        if (company == null && dto.getCompanyName() != null && !dto.getCompanyName().trim().isEmpty()) {
            company = companyRepository.findByName(dto.getCompanyName().trim())
                    .orElseGet(() -> companyRepository.save(new Company(
                            dto.getCompanyName().trim(),
                            "Corporate Partner",
                            dto.getLocation() != null ? dto.getLocation() : "Campus Drive",
                            "https://" + dto.getCompanyName().trim().toLowerCase().replaceAll("[^a-z0-9]", "") + ".example",
                            "Verified Campus Hiring Partner"
                    )));
        }
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        }
        JobPosting jobPosting = new JobPosting(
                dto.getTitle(),
                company,
                dto.getLocation(),
                dto.getJobType(),
                dto.getDescription(),
                dto.getSkillsRequired(),
                dto.getSalaryRange());
        jobPosting.setApplicationDeadline(dto.getApplicationDeadline());
        jobPosting.setActive(dto.isActive());
        return toDto(jobPostingRepository.save(jobPosting));
    }

    public JobPostingDto update(Long id, JobPostingDto dto) {
        JobPosting jobPosting = getEntity(id);
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        jobPosting.setTitle(dto.getTitle());
        jobPosting.setCompany(company);
        jobPosting.setLocation(dto.getLocation());
        jobPosting.setJobType(dto.getJobType());
        jobPosting.setDescription(dto.getDescription());
        jobPosting.setSkillsRequired(dto.getSkillsRequired());
        jobPosting.setSalaryRange(dto.getSalaryRange());
        jobPosting.setApplicationDeadline(dto.getApplicationDeadline());
        jobPosting.setActive(dto.isActive());
        return toDto(jobPostingRepository.save(jobPosting));
    }

    public void delete(Long id) {
        jobPostingRepository.delete(getEntity(id));
    }

    private JobPosting getEntity(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job posting not found"));
    }

    private JobPostingDto toDto(JobPosting entity) {
        JobPostingDto dto = new JobPostingDto(
                entity.getId(),
                entity.getTitle(),
                entity.getCompany() != null ? entity.getCompany().getId() : null,
                entity.getCompany() != null ? entity.getCompany().getName() : null,
                entity.getLocation(),
                entity.getJobType(),
                entity.getDescription(),
                entity.getSkillsRequired(),
                entity.getSalaryRange(),
                entity.getPostedDate(),
                entity.isActive());
        dto.setApplicationDeadline(entity.getApplicationDeadline());
        return dto;
    }
}
