package config

import (
	"path/filepath"
	"testing"
)

func TestLoadNormalizesKindAndTags(t *testing.T) {
	cfg, err := Load(filepath.Join("..", "..", "demos", "sample-config.json"))
	if err != nil {
		t.Fatalf("Load returned error: %v", err)
	}

	if cfg.TeamName != "Platform Team" {
		t.Fatalf("unexpected team name: %q", cfg.TeamName)
	}
	if got := cfg.Sources[0].Kind; got != "github" {
		t.Fatalf("expected normalized kind, got %q", got)
	}
	if got := cfg.Sources[0].Tags[0]; got != "backend" {
		t.Fatalf("expected sorted normalized tags, got %q", got)
	}
}

func TestLoadRejectsMissingTeamName(t *testing.T) {
	_, err := Load(filepath.Join("..", "..", "demos", "invalid-config.json"))
	if err == nil {
		t.Fatal("expected validation error")
	}
}
