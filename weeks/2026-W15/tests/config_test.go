package tests

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"week15/src"
)

func TestLoadConfig(t *testing.T) {
	cfg := src.SampleConfig()
	payload, err := json.Marshal(cfg)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	tmp := filepath.Join(t.TempDir(), "config.json")
	if err := os.WriteFile(tmp, payload, 0o644); err != nil {
		t.Fatalf("write: %v", err)
	}
	loaded, err := src.LoadConfig(tmp)
	if err != nil {
		t.Fatalf("load: %v", err)
	}
	if len(loaded.Repos) != len(cfg.Repos) {
		t.Fatalf("expected %d repos, got %d", len(cfg.Repos), len(loaded.Repos))
	}
}
