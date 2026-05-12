package tests

import (
	"strings"
	"testing"
	"time"

	"repodigest/internal/app"
	"repodigest/internal/model"
)

func TestBuildSummaryCountsKindsAndTags(t *testing.T) {
	cfg := model.Config{
		TeamName: "Platform Team",
		Sources: []model.Source{
			{Name: "core-api", Kind: "github", URL: "https://example.com/core-api", Tags: []string{"api", "backend"}, UpdateCadence: "weekly"},
			{Name: "release-feed", Kind: "rss", URL: "https://example.com/feed.xml", Tags: []string{"backend", "release"}, UpdateCadence: "monthly"},
		},
	}

	summary := app.BuildSummary(cfg, time.Date(2026, 5, 12, 7, 0, 0, 0, time.UTC))

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
}

func TestRenderMarkdownIncludesCoreFields(t *testing.T) {
	summary := model.Summary{
		GeneratedAt:      time.Date(2026, 5, 12, 7, 0, 0, 0, time.UTC),
		TeamName:         "Platform Team",
		TotalSources:     3,
		SourcesByKind:    map[string]int{"github": 2, "rss": 1},
		UniqueTags:       []string{"api", "security"},
		SlowCadenceCount: 1,
	}

	out := app.RenderMarkdown(summary)
	for _, want := range []string{"Repo Digest Summary", "Platform Team", "github: 2", "security"} {
		if !strings.Contains(out, want) {
			t.Fatalf("expected output to contain %q, got:\n%s", want, out)
		}
	}
}
