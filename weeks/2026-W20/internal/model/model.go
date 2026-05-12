package model

import "time"

type Source struct {
	Name          string   `json:"name"`
	Kind          string   `json:"kind"`
	URL           string   `json:"url"`
	Tags          []string `json:"tags,omitempty"`
	UpdateCadence string   `json:"updateCadence,omitempty"`
}

type Config struct {
	TeamName string   `json:"teamName"`
	Sources  []Source `json:"sources"`
}

type Summary struct {
	GeneratedAt      time.Time
	TeamName         string
	TotalSources     int
	SourcesByKind    map[string]int
	UniqueTags       []string
	SlowCadenceCount int
}
