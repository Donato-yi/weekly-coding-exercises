package src

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Config struct {
	Report ReportConfig `json:"report"`
	Repos  []RepoConfig `json:"repos"`
}

type ReportConfig struct {
	OutputDir string `json:"outputDir"`
	Format    string `json:"format"` // markdown | json
}

type RepoConfig struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	TestCommand string `json:"testCommand"`
	LintCommand string `json:"lintCommand"`
}

func LoadConfig(path string) (Config, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return Config{}, err
	}
	var cfg Config
	if err := json.Unmarshal(content, &cfg); err != nil {
		return Config{}, err
	}
	if len(cfg.Repos) == 0 {
		return Config{}, fmt.Errorf("config must include at least one repo")
	}
	return cfg, nil
}

func SampleConfig() Config {
	return Config{
		Report: ReportConfig{
			OutputDir: "demos",
			Format:    "markdown",
		},
		Repos: []RepoConfig{
			{
				Name:        "example-api",
				Path:        filepath.FromSlash("../example-api"),
				TestCommand: "go test ./...",
				LintCommand: "golangci-lint run",
			},
			{
				Name:        "example-web",
				Path:        filepath.FromSlash("../example-web"),
				TestCommand: "npm test",
				LintCommand: "npm run lint",
			},
		},
	}
}
