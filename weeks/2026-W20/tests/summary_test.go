package tests

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"repodigest/internal/app"
	"repodigest/internal/model"
)

func testConfig() model.Config {
	return model.Config{
		TeamName: "Platform Team",
		Sources: []model.Source{
			{
				Name:          "core-api",
				Kind:          "github",
				URL:           "https://example.com/core-api",
				Tags:          []string{"api", "backend"},
				UpdateCadence: "weekly",
				Signals: model.RepoSignals{
					Stars:            320,
					OpenIssues:       6,
					DaysSinceCommit:  2,
					DaysSinceRelease: 14,
					CI:               "passing",
				},
			},
			{
				Name:          "release-feed",
				Kind:          "rss",
				URL:           "https://example.com/feed.xml",
				Tags:          []string{"backend", "release"},
				UpdateCadence: "monthly",
				Signals: model.RepoSignals{
					Stars:              8,
					OpenIssues:         58,
					DaysSinceCommit:    67,
					DaysSinceRelease:   120,
					CI:                 "failing",
					OpenSecurityAlerts: 2,
				},
			},
		},
	}
}

func TestBuildSummaryCountsKindsTagsAndRiskBuckets(t *testing.T) {
	cfg := testConfig()
	summary := app.BuildSummary(cfg, time.Date(2026, 5, 13, 7, 0, 0, 0, time.UTC))

	if summary.TotalSources != 2 {
		t.Fatalf("expected 2 sources, got %d", summary.TotalSources)
	}
	if summary.SourcesByKind["github"] != 1 || summary.SourcesByKind["rss"] != 1 {
		t.Fatalf("unexpected kind counts: %#v", summary.SourcesByKind)
	}
	if summary.SlowCadenceCount != 1 {
		t.Fatalf("expected 1 slow cadence source, got %d", summary.SlowCadenceCount)
	}
	if strings.Join(summary.UniqueTags, ",") != "api,backend,release" {
		t.Fatalf("unexpected tags: %v", summary.UniqueTags)
	}
	if summary.HighestRiskCount != 1 || summary.HealthyCount != 1 {
		t.Fatalf("unexpected risk buckets: high=%d healthy=%d", summary.HighestRiskCount, summary.HealthyCount)
	}
	if len(summary.SourceScores) != 2 || summary.SourceScores[0].Name != "release-feed" {
		t.Fatalf("expected release-feed to be lowest score, got %#v", summary.SourceScores)
	}
}

func TestBuildFilteredSummaryAppliesRiskAndKindFilters(t *testing.T) {
	cfg := testConfig()
	summary := app.BuildFilteredSummary(cfg, time.Date(2026, 5, 13, 7, 0, 0, 0, time.UTC), model.Filter{
		Kind: "rss",
		Risk: "high",
	})

	if summary.TotalSources != 1 {
		t.Fatalf("expected 1 filtered source, got %d", summary.TotalSources)
	}
	if summary.SourceScores[0].Name != "release-feed" {
		t.Fatalf("expected release-feed, got %#v", summary.SourceScores)
	}
	if summary.AppliedFilter.Kind != "rss" || summary.AppliedFilter.Risk != "high" {
		t.Fatalf("unexpected filter: %#v", summary.AppliedFilter)
	}
}

func TestRenderMarkdownIncludesHealthWatchlistAndFilters(t *testing.T) {
	summary := model.Summary{
		GeneratedAt:      time.Date(2026, 5, 13, 7, 0, 0, 0, time.UTC),
		TeamName:         "Platform Team",
		TotalSources:     3,
		SourcesByKind:    map[string]int{"github": 2, "rss": 1},
		UniqueTags:       []string{"api", "security"},
		SlowCadenceCount: 1,
		AverageScore:     76,
		HighestRiskCount: 1,
		WatchlistCount:   1,
		HealthyCount:     1,
		AppliedFilter:    model.Filter{Kind: "github"},
		SourceScores: []model.SourceScore{
			{Name: "frontend-app", Kind: "github", Score: 61, Risk: model.RiskMedium, Reasons: []string{"CI is flaky"}},
		},
	}

	out := app.RenderMarkdown(summary)
	for _, want := range []string{"Repo Digest Summary", "Platform Team", "github: 2", "Average health score: 76", "Health watchlist", "frontend-app", "Filters: kind=github"} {
		if !strings.Contains(out, want) {
			t.Fatalf("expected output to contain %q, got:\n%s", want, out)
		}
	}
}

func TestRenderJSONIncludesStructuredFields(t *testing.T) {
	summary := model.Summary{
		GeneratedAt:   time.Date(2026, 5, 13, 7, 0, 0, 0, time.UTC),
		TeamName:      "Platform Team",
		TotalSources:  1,
		AppliedFilter: model.Filter{Risk: "high"},
		SourceScores: []model.SourceScore{
			{Name: "release-feed", Kind: "rss", Score: 0, Risk: model.RiskHigh, Reasons: []string{"CI is failing"}},
		},
	}

	out, err := app.RenderJSON(summary)
	if err != nil {
		t.Fatalf("RenderJSON returned error: %v", err)
	}
	for _, want := range []string{"\"teamName\": \"Platform Team\"", "\"risk\": \"high\"", "\"sourceScores\""} {
		if !strings.Contains(out, want) {
			t.Fatalf("expected JSON output to contain %q, got:\n%s", want, out)
		}
	}
}

func TestWriteOutputCreatesParentDirectories(t *testing.T) {
	tmp := t.TempDir()
	outputPath := filepath.Join(tmp, "generated", "summary.md")
	content := "# ok\n"

	if err := app.WriteOutput(outputPath, content); err != nil {
		t.Fatalf("WriteOutput returned error: %v", err)
	}

	data, err := os.ReadFile(outputPath)
	if err != nil {
		t.Fatalf("ReadFile returned error: %v", err)
	}
	if string(data) != content {
		t.Fatalf("unexpected written content: %q", string(data))
	}
}

func TestWriteOutputSkipsEmptyPath(t *testing.T) {
	if err := app.WriteOutput("", "ignored"); err != nil {
		t.Fatalf("expected nil error for empty output path, got %v", err)
	}
}
