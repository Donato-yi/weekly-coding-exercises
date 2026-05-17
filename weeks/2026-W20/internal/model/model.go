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
	Name    string    `json:"name"`
	Kind    string    `json:"kind"`
	Score   int       `json:"score"`
	Risk    RiskLevel `json:"risk"`
	Reasons []string  `json:"reasons"`
	NextStep string   `json:"nextStep,omitempty"`
}

type Summary struct {
	GeneratedAt       time.Time         `json:"generatedAt"`
	TeamName          string            `json:"teamName"`
	TotalSources      int               `json:"totalSources"`
	SourcesByKind     map[string]int    `json:"sourcesByKind"`
	UniqueTags        []string          `json:"uniqueTags"`
	SlowCadenceCount  int               `json:"slowCadenceCount"`
	AverageScore      int               `json:"averageScore"`
	HighestRiskCount  int               `json:"highestRiskCount"`
	WatchlistCount    int               `json:"watchlistCount"`
	HealthyCount      int               `json:"healthyCount"`
	AppliedFilter     Filter            `json:"appliedFilter"`
	SourceScores      []SourceScore     `json:"sourceScores"`
}

type Filter struct {
	Kind string `json:"kind,omitempty"`
	Risk string `json:"risk,omitempty"`
	Tag  string `json:"tag,omitempty"`
}

type RunArtifact struct {
	Name   string `json:"name"`
	Path   string `json:"path"`
	Format string `json:"format"`
	Status string `json:"status"`
	Error  string `json:"error,omitempty"`
}

type RunStatus struct {
	GeneratedAt      time.Time     `json:"generatedAt"`
	TeamName         string        `json:"teamName,omitempty"`
	ConfigPath       string        `json:"configPath"`
	OutputDir        string        `json:"outputDir"`
	ContinueOnError  bool          `json:"continueOnError"`
	Success          bool          `json:"success"`
	Errors           []string      `json:"errors,omitempty"`
	Artifacts        []RunArtifact `json:"artifacts"`
}
