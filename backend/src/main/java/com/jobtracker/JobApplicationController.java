package com.jobtracker;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class JobApplicationController {
    private final JobApplicationRepository repository;
    private final String accessPassword;

    public JobApplicationController(
            JobApplicationRepository repository,
            @Value("${app.access.password:Ankit123@!}") String accessPassword
    ) {
        this.repository = repository;
        this.accessPassword = accessPassword;
    }

    @GetMapping
    public ResponseEntity<List<JobApplication>> getJobs(@RequestHeader(value = "X-App-Password", required = false) String password) {
        if (!hasAccess(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<JobApplication> addJob(
            @RequestHeader(value = "X-App-Password", required = false) String password,
            @Valid @RequestBody JobApplication job
    ) {
        if (!hasAccess(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(repository.save(job));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateJob(
            @RequestHeader(value = "X-App-Password", required = false) String password,
            @PathVariable Long id,
            @Valid @RequestBody JobApplication updatedJob
    ) {
        if (!hasAccess(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return repository.findById(id)
                .map(job -> {
                    job.setCompany(updatedJob.getCompany());
                    job.setRole(updatedJob.getRole());
                    job.setStatus(updatedJob.getStatus());
                    job.setNumberOfApplications(updatedJob.getNumberOfApplications());
                    job.setAppliedDate(updatedJob.getAppliedDate());
                    job.setRecruiter(updatedJob.getRecruiter());
                    job.setNotes(updatedJob.getNotes());
                    return ResponseEntity.ok(repository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @RequestHeader(value = "X-App-Password", required = false) String password,
            @PathVariable Long id
    ) {
        if (!hasAccess(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAccess(String password) {
        return accessPassword.equals(password);
    }
}
