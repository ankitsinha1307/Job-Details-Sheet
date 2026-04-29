package com.jobtracker;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class JobApplicationController {
    private final JobApplicationRepository repository;

    public JobApplicationController(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<JobApplication> getJobs() {
        return repository.findAll();
    }

    @PostMapping
    public JobApplication addJob(@Valid @RequestBody JobApplication job) {
        return repository.save(job);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateJob(@PathVariable Long id, @Valid @RequestBody JobApplication updatedJob) {
        return repository.findById(id)
                .map(job -> {
                    job.setCompany(updatedJob.getCompany());
                    job.setRole(updatedJob.getRole());
                    job.setStatus(updatedJob.getStatus());
                    job.setAppliedDate(updatedJob.getAppliedDate());
                    job.setRecruiter(updatedJob.getRecruiter());
                    job.setNotes(updatedJob.getNotes());
                    return ResponseEntity.ok(repository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
