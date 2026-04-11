package tests

import (
    "strings"
    "testing"

    "weekly-coding-exercises/src"
)

func TestRenderMarkdownReportIncludesSummary(t *testing.T) {
    report := src.Report{
        GeneratedAt: "2026-04-11T00:00:00Z",
        Summary: src.ReportSummary{
            ReposScanned:        2,
            DirtyRepos:          1,
            TestFailures:        0,
            LintFailures:        0,
            DependencyManifests: 1,
        },
        Repos: []src.RepoReport{{Name: "demo", Path: "/tmp/demo"}},
    }

    output := src.RenderMarkdownReport(report)
    for _, needle := range []string{"# Weekly Repo Health Report", "## Summary", "Repos scanned: 2"} {
        if !strings.Contains(output, needle) {
            t.Fatalf("expected markdown to contain %q", needle)
        }
    }
}
