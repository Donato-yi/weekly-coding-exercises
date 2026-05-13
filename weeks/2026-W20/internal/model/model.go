package model

import "time"

type RepoSignals struct {
	Stars              int    `json:"stars,omitempty"`
	OpenIssues         int    `json:"openIssues,omitempty"`
	DaysSinceCommit    int    `json:"daysSinceCommit,omitempty"`
	DaysSinceRelease   int    `json:"daysSinceRelease,omitempty"`
	CI                 string `json:"ci,omitempty"`
	OpenSecurityAlerts int    `json:"openSecurityAlerts,omitempty"`
}

type Source struct {
	Name          string      `json:"name"`
	Kind          string      `json:"kind"`
	URL           string      `json:"url"`
	Tags          []string    `json:"tags,omitempty"`
	UpdateCadence string      `json:"updateCadence,omitempty"`
	Signals       RepoSignals `json:"signals,omitempty"`
}

type Config struct {
	TeamName string   `json:"teamName"`
	Sources  []Source `json:"sources"`
}

type RiskLevel string

const (
	RiskLow    RiskLevel = "low"
	RiskMedium RiskLevel = "medium"
	RiskHigh   RiskLevel = "high"
)

type SourceScore struct {
	Name    string
	Kind    string
	Score   int
	Risk    RiskLevel
	Reasons []string
}

type Summary struct {
	GeneratedAt       time.Time
	TeamName          string
	TotalSources      int
	SourcesByKind     map[string]int
	UniqueTags        []string
	SlowCadenceCount  int
	AverageScore      int
	HighestRiskCount  int
	WatchlistCount    int
	HealthyCount      int
	SourceScores      []SourceScore
}
