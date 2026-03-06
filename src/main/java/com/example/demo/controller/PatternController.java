package com.example.demo.controller;

import com.example.demo.model.Pattern;
import com.example.demo.service.SequencerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/patterns")
@CrossOrigin(origins = "*")
public class PatternController {

    @Autowired
    private SequencerService sequencerService;

    @GetMapping
    public List<Pattern> getAllPatterns() {
        return sequencerService.getAllPatterns();
    }

    @PostMapping
    public Pattern savePattern(@RequestBody Pattern pattern) {
        return sequencerService.savePattern(pattern);
    }

    @GetMapping("/{id}")
    public Pattern getPattern(@PathVariable Long id) {
        return sequencerService.getPatternById(id);
    }

    @DeleteMapping("/{id}")
    public void deletePattern(@PathVariable Long id) {
        sequencerService.deletePattern(id);
    }
}