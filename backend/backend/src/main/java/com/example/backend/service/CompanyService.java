package com.example.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.CompanyDto;
import com.example.backend.model.Company;
import com.example.backend.repository.CompanyRepository;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<CompanyDto> getAll() {
        return companyRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public CompanyDto getById(Long id) {
        return toDto(getEntity(id));
    }

    public CompanyDto create(CompanyDto dto) {
        Company company = new Company(
                dto.getName(),
                dto.getIndustry(),
                dto.getLocation(),
                dto.getWebsite(),
                dto.getDescription());
        return toDto(companyRepository.save(company));
    }

    public CompanyDto update(Long id, CompanyDto dto) {
        Company company = getEntity(id);
        company.setName(dto.getName());
        company.setIndustry(dto.getIndustry());
        company.setLocation(dto.getLocation());
        company.setWebsite(dto.getWebsite());
        company.setDescription(dto.getDescription());
        return toDto(companyRepository.save(company));
    }

    public void delete(Long id) {
        companyRepository.delete(getEntity(id));
    }

    private Company getEntity(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
    }

    private CompanyDto toDto(Company company) {
        return new CompanyDto(
                company.getId(),
                company.getName(),
                company.getIndustry(),
                company.getLocation(),
                company.getWebsite(),
                company.getDescription());
    }
}
