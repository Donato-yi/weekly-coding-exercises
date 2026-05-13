package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"sort"
	"strings"

	"repodigest/internal/model"
)

func Load(path string) (model.Config, error) {
	var cfg model.Config

	data, err := os.ReadFile(path)
	if err != nil {
		return cfg, fmt.Errorf("read config: %w", err)
	}

	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("parse config: %w", err)
	}

	if err := Validate(cfg); err != nil {
		return cfg, err
	}

	return normalize(cfg), nil
}

func Validate(cfg model.Config) error {
	if strings.TrimSpace(cfg.TeamName) == "" {
		return errors.New("teamName is required")
	}
	if len(cfg.Sources) == 0 {
		return errors.New("at least one source is required")
	}

	for i, source := range cfg.Sources {
		if strings.TrimSpace(source.Name) == "" {
			return fmt.Errorf("sources[%d].name is required", i)
		}
		if strings.TrimSpace(source.Kind) == "" {
			return fmt.Errorf("sources[%d].kind is required", i)
		}
		if strings.TrimSpace(source.URL) == "" {
			return fmt.Errorf("sources[%d].url is required", i)
		}
		if source.Signals.Stars < 0 {
			return fmt.Errorf("sources[%d].signals.stars must be non-negative", i)
		}
		if source.Signals.OpenIssues < 0 {
			return fmt.Errorf("sources[%d].signals.openIssues must be non-negative", i)
		}
		if source.Signals.DaysSinceCommit < 0 {
			return fmt.Errorf("sources[%d].signals.daysSinceCommit must be non-negative", i)
		}
		if source.Signals.DaysSinceRelease < 0 {
			return fmt.Errorf("sources[%d].signals.daysSinceRelease must be non-negative", i)
		}
		if source.Signals.OpenSecurityAlerts < 0 {
			return fmt.Errorf("sources[%d].signals.openSecurityAlerts must be non-negative", i)
		}
	}

	return nil
}

func normalize(cfg model.Config) model.Config {
	cfg.TeamName = strings.TrimSpace(cfg.TeamName)
	for i := range cfg.Sources {
		cfg.Sources[i].Name = strings.TrimSpace(cfg.Sources[i].Name)
		cfg.Sources[i].Kind = strings.ToLower(strings.TrimSpace(cfg.Sources[i].Kind))
		cfg.Sources[i].URL = strings.TrimSpace(cfg.Sources[i].URL)
		cfg.Sources[i].UpdateCadence = strings.ToLower(strings.TrimSpace(cfg.Sources[i].UpdateCadence))
		cfg.Sources[i].Signals.CI = strings.ToLower(strings.TrimSpace(cfg.Sources[i].Signals.CI))

		cleanTags := make([]string, 0, len(cfg.Sources[i].Tags))
		for _, tag := range cfg.Sources[i].Tags {
			tag = strings.ToLower(strings.TrimSpace(tag))
			if tag != "" {
				cleanTags = append(cleanTags, tag)
			}
		}
		sort.Strings(cleanTags)
		cfg.Sources[i].Tags = cleanTags
	}
	return cfg
}
