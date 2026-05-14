package app

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"repodigest/internal/model"
)

func BuildSummary(cfg model.Config, now time.Time) model.Summary {
	return buildSummary(cfg, now, model.Filter{})
}

func BuildFilteredSummary(cfg model.Config, now time.Time, filter model.Filter) model.Summary {
	return buildSummary(cfg, now, normalizeFilter(filter))
}

func buildSummary(cfg model.Config, now time.Time, filter model.Filter) model.Summary {
	byKind := map[string]int{}
	tagSet := map[string]struct{}{}
	slowCadenceCount := 0
	totalScore := 0
	highestRiskCount := 0
	watchlistCount := 0
	healthyCount := 0
	sourceScores := make([]model.SourceScore, 0, len(cfg.Sources))

	for _, source := range cfg.Sources {
		score := scoreSource(source)
		if !matchesFilter(source, score, filter) {
			continue
		}

		byKind[source.Kind]++
		if source.UpdateCadence == "monthly" || source.UpdateCadence == "quarterly" {
			slowCadenceCount++
		}
		for _, tag := range source.Tags {
			tagSet[tag] = struct{}{}
		}

		totalScore += score.Score
		sourceScores = append(sourceScores, score)
		switch score.Risk {
		case model.RiskHigh:
			highestRiskCount++
		case model.RiskMedium:
			watchlistCount++
		default:
			healthyCount++
		}
	}

	uniqueTags := make([]string, 0, len(tagSet))
	for tag := range tagSet {
		uniqueTags = append(uniqueTags, tag)
	}
	sort.Strings(uniqueTags)

	sort.Slice(sourceScores, func(i, j int) bool {
		if sourceScores[i].Score == sourceScores[j].Score {
			return sourceScores[i].Name < sourceScores[j].Name
		}
		return sourceScores[i].Score < sourceScores[j].Score
	})

	averageScore := 0
	if len(sourceScores) > 0 {
		averageScore = totalScore / len(sourceScores)
	}

	return model.Summary{
		GeneratedAt:      now.UTC(),
		TeamName:         cfg.TeamName,
		TotalSources:     len(sourceScores),
		SourcesByKind:    byKind,
		UniqueTags:       uniqueTags,
		SlowCadenceCount: slowCadenceCount,
		AverageScore:     averageScore,
		HighestRiskCount: highestRiskCount,
		WatchlistCount:   watchlistCount,
		HealthyCount:     healthyCount,
		AppliedFilter:    filter,
		SourceScores:     sourceScores,
	}
}

func scoreSource(source model.Source) model.SourceScore {
	score := 100
	reasons := []string{}
	signals := source.Signals

	if signals.DaysSinceCommit >= 45 {
		score -= 25
		reasons = append(reasons, fmt.Sprintf("stale commits (%d days)", signals.DaysSinceCommit))
	} else if signals.DaysSinceCommit >= 21 {
		score -= 10
		reasons = append(reasons, fmt.Sprintf("slowing commit cadence (%d days)", signals.DaysSinceCommit))
	}

	if signals.DaysSinceRelease >= 90 {
		score -= 15
		reasons = append(reasons, fmt.Sprintf("old release (%d days)", signals.DaysSinceRelease))
	} else if signals.DaysSinceRelease >= 45 {
		score -= 8
		reasons = append(reasons, fmt.Sprintf("release cadence drifting (%d days)", signals.DaysSinceRelease))
	}

	if signals.OpenIssues >= 50 {
		score -= 18
		reasons = append(reasons, fmt.Sprintf("large issue backlog (%d open)", signals.OpenIssues))
	} else if signals.OpenIssues >= 20 {
		score -= 8
		reasons = append(reasons, fmt.Sprintf("growing issue backlog (%d open)", signals.OpenIssues))
	}

	if signals.OpenSecurityAlerts > 0 {
		penalty := signals.OpenSecurityAlerts * 12
		if penalty > 24 {
			penalty = 24
		}
		score -= penalty
		reasons = append(reasons, fmt.Sprintf("security alerts open (%d)", signals.OpenSecurityAlerts))
	}

	switch signals.CI {
	case "failing":
		score -= 20
		reasons = append(reasons, "CI is failing")
	case "flaky":
		score -= 10
		reasons = append(reasons, "CI is flaky")
	}

	if source.Kind == "github" {
		if signals.Stars < 10 {
			score -= 5
			reasons = append(reasons, fmt.Sprintf("low adoption signal (%d stars)", signals.Stars))
		} else if signals.Stars >= 200 {
			score += 3
		}
	}

	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	risk := model.RiskLow
	if score < 55 {
		risk = model.RiskHigh
	} else if score < 80 {
		risk = model.RiskMedium
	}

	if len(reasons) == 0 {
		reasons = append(reasons, "healthy recent activity")
	}

	return model.SourceScore{
		Name:    source.Name,
		Kind:    source.Kind,
		Score:   score,
		Risk:    risk,
		Reasons: reasons,
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
	fmt.Fprintf(&b, "- Average health score: %d\n", summary.AverageScore)
	fmt.Fprintf(&b, "- High risk sources: %d\n", summary.HighestRiskCount)
	fmt.Fprintf(&b, "- Watchlist sources: %d\n", summary.WatchlistCount)
	fmt.Fprintf(&b, "- Healthy sources: %d\n", summary.HealthyCount)
	if summary.AppliedFilter.Kind != "" || summary.AppliedFilter.Risk != "" {
		fmt.Fprintf(&b, "- Filters: %s\n", renderFilterLabel(summary.AppliedFilter))
	}
	fmt.Fprintf(&b, "- Tags: %s\n\n", strings.Join(summary.UniqueTags, ", "))
	fmt.Fprintf(&b, "## Sources by kind\n")
	for _, kind := range kinds {
		fmt.Fprintf(&b, "- %s: %d\n", kind, summary.SourcesByKind[kind])
	}
	fmt.Fprintf(&b, "\n## Health watchlist\n")
	for _, score := range summary.SourceScores {
		fmt.Fprintf(&b, "- %s (%s): score %d, risk %s, %s\n", score.Name, score.Kind, score.Score, score.Risk, strings.Join(score.Reasons, "; "))
	}
	return b.String()
}

func RenderJSON(summary model.Summary) (string, error) {
	data, err := json.MarshalIndent(summary, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data) + "\n", nil
}

func RenderReview(summary model.Summary) string {
	var highRisk []model.SourceScore
	var watchlist []model.SourceScore
	var healthy []model.SourceScore

	for _, score := range summary.SourceScores {
		switch score.Risk {
		case model.RiskHigh:
			highRisk = append(highRisk, score)
		case model.RiskMedium:
			watchlist = append(watchlist, score)
		default:
			healthy = append(healthy, score)
		}
	}

	var b strings.Builder
	fmt.Fprintf(&b, "# Repo Digest Review\n\n")
	fmt.Fprintf(&b, "- Generated: %s\n", summary.GeneratedAt.Format(time.RFC3339))
	fmt.Fprintf(&b, "- Team: %s\n", summary.TeamName)
	fmt.Fprintf(&b, "- Total sources reviewed: %d\n", summary.TotalSources)
	fmt.Fprintf(&b, "- High risk: %d\n", len(highRisk))
	fmt.Fprintf(&b, "- Watchlist: %d\n", len(watchlist))
	fmt.Fprintf(&b, "- Healthy: %d\n\n", len(healthy))

	renderReviewSection(&b, "Act now", highRisk, "No urgent maintenance work surfaced in this run.")
	b.WriteString("\n")
	renderReviewSection(&b, "Watchlist", watchlist, "No medium-risk follow-ups right now.")
	b.WriteString("\n")
	renderReviewSection(&b, "Healthy", healthy, "No healthy sources were included in this run.")

	return b.String()
}

func renderReviewSection(b *strings.Builder, title string, scores []model.SourceScore, empty string) {
	fmt.Fprintf(b, "## %s\n", title)
	if len(scores) == 0 {
		fmt.Fprintf(b, "- %s\n", empty)
		return
	}

	for _, score := range scores {
		fmt.Fprintf(b, "- [ ] %s (%s) score %d: %s\n", score.Name, score.Kind, score.Score, strings.Join(score.Reasons, "; "))
	}
}

func WriteOutput(path string, content string) error {
	path = strings.TrimSpace(path)
	if path == "" {
		return nil
	}

	dir := filepath.Dir(path)
	if dir != "." && dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return fmt.Errorf("create output directory: %w", err)
		}
	}

	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		return fmt.Errorf("write output file: %w", err)
	}
	return nil
}

func matchesFilter(source model.Source, score model.SourceScore, filter model.Filter) bool {
	if filter.Kind != "" && source.Kind != filter.Kind {
		return false
	}
	if filter.Risk != "" && string(score.Risk) != filter.Risk {
		return false
	}
	if filter.Tag != "" && !hasTag(source.Tags, filter.Tag) {
		return false
	}
	return true
}

func normalizeFilter(filter model.Filter) model.Filter {
	filter.Kind = strings.ToLower(strings.TrimSpace(filter.Kind))
	filter.Risk = strings.ToLower(strings.TrimSpace(filter.Risk))
	filter.Tag = strings.ToLower(strings.TrimSpace(filter.Tag))
	return filter
}

func renderFilterLabel(filter model.Filter) string {
	parts := []string{}
	if filter.Kind != "" {
		parts = append(parts, fmt.Sprintf("kind=%s", filter.Kind))
	}
	if filter.Risk != "" {
		parts = append(parts, fmt.Sprintf("risk=%s", filter.Risk))
	}
	if filter.Tag != "" {
		parts = append(parts, fmt.Sprintf("tag=%s", filter.Tag))
	}
	return strings.Join(parts, ", ")
}

func hasTag(tags []string, want string) bool {
	for _, tag := range tags {
		if strings.EqualFold(strings.TrimSpace(tag), want) {
			return true
		}
	}
	return false
}
