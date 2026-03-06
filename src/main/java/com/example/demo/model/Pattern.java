package com.example.demo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Pattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int bpm;
    private int steps;

    @ElementCollection
    private List<Boolean> kickPattern;

    @ElementCollection
    private List<Boolean> snarePattern;

    @ElementCollection
    private List<Boolean> hihatPattern;

    public Pattern() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getBpm() { return bpm; }
    public void setBpm(int bpm) { this.bpm = bpm; }
    public int getSteps() { return steps; }
    public void setSteps(int steps) { this.steps = steps; }
    public List<Boolean> getKickPattern() { return kickPattern; }
    public void setKickPattern(List<Boolean> kickPattern) { this.kickPattern = kickPattern; }
    public List<Boolean> getSnarePattern() { return snarePattern; }
    public void setSnarePattern(List<Boolean> snarePattern) { this.snarePattern = snarePattern; }
    public List<Boolean> getHihatPattern() { return hihatPattern; }
    public void setHihatPattern(List<Boolean> hihatPattern) { this.hihatPattern = hihatPattern; }
}