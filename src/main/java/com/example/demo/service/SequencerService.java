package com.example.demo.service;

import com.example.demo.model.Pattern;
import com.example.demo.repository.PatternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SequencerService {

    @Autowired
    private PatternRepository patternRepository;

    public List<Pattern> getAllPatterns() {
        return patternRepository.findAll();
    }

    public Pattern savePattern(Pattern pattern) {
        return patternRepository.save(pattern);
    }

    public Pattern getPatternById(Long id) {
        return patternRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pattern not found"));
    }

    public void deletePattern(Long id) {
        patternRepository.deleteById(id);
    }
}