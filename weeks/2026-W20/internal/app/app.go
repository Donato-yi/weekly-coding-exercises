package app

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"repodigest/internal/model"
)

func BuildSummary(cfg model.Config, now time.Time) model.Summary {
	byKind := map[string]int{}
	tagSet := map[string]struct{}{}
	slowCadenceCount := 0

	for _, source := range cfg.Sources {
		byKind[source.Kind]++
		if source.UpdateCadence == "monthly" || source.UpdateCadence == "quarterly" {
			slowCadenceCount++
		}
		for _, tag := range source.Tags {
			tagSet[tag] = struct{}{}
		}
	}

	uniqueTags := make([]string, 0, len(tagSet))
	for tag := range tagSet {
		uniqueTags = append(uniqueTags, tag)
	}
	sort.Strings(uniqueTags)

	return model.Summary{
		GeneratedAt:      now.UTC(),
		TeamName:         cfg.TeamName,
		TotalSources:     len(cfg.Sources),
		SourcesByKind:    byKind,
		UniqueTags:       uniqueTags,
		SlowCadenceCount: slowCadenceCount,
	}
}

func RenderMarkdown(summary model.Summary) string {
	kinds := make([]string, 0, len(summary.SourcesByKind))
	for kind := range summary.SourcesByKind {
		kinds = append(kinds, kind)
	}
	sort.Strings(kinds)

	var b strings.Builder
	fmt.Fprintf(&b, "# Repo Digest Summary\n\n")
	fmt.Fprintf(&b, "- Generated: %s\n", summary.GeneratedAt.Format(time.RFC3339))
	fmt.Fprintf(&b, "- Team: %s\n", summary.TeamName)
	fmt.Fprintf(&b, "- Total sources: %d\n", summary.TotalSources)
	fmt.Fprintf(&b, "- Slow cadence sources: %d\n", summary.SlowCadenceCount)
	fmt.Fprintf(&b, "- Tags: %s\n\n", strings.Join(summary.UniqueTags, ", "))
	fmt.Fprintf(&b, "## Sources by kind\n")
	for _, kind := range kinds {
		fmt.Fprintf(&b, "- %s: %d\n", kind, summary.SourcesByKind[kind])
	}
	return b.String()
}
