package tests

import (
	"strings"
	"testing"
	"time"

	"repodigest/internal/app"
	"repodigest/internal/model"
)

func TestBuildSummaryCountsKindsTagsAndRiskBuckets(t *testing.T) {
	cfg := model.Config{
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

func TestRenderMarkdownIncludesHealthWatchlist(t *testing.T) {
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
		SourceScores: []model.SourceScore{
			{Name: "frontend-app", Kind: "github", Score: 61, Risk: model.RiskMedium, Reasons: []string{"CI is flaky"}},
		},
	}

	out := app.RenderMarkdown(summary)
	for _, want := range []string{"Repo Digest Summary", "Platform Team", "github: 2", "Average health score: 76", "Health watchlist", "frontend-app"} {
		if !strings.Contains(out, want) {
			t.Fatalf("expected output to contain %q, got:\n%s", want, out)
		}
	}
}
