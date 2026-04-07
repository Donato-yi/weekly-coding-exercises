package tests

import (
	"strings"
	"testing"

	"week15/src"
)

func TestBuildReportIncludesRepos(t *testing.T) {
	cfg := src.SampleConfig()
	report := src.BuildReportForTest(cfg)
	for _, repo := range cfg.Repos {
		if !strings.Contains(report, repo.Name) {
			t.Fatalf("report missing repo %s", repo.Name)
		}
	}
}
