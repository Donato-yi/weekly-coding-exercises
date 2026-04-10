package src

import (
    "encoding/json"
    "fmt"
    "strings"
    "time"
)

type Report struct {
    GeneratedAt string        `json:"generatedAt"`
    Summary     ReportSummary `json:"summary"`
    Repos       []RepoReport  `json:"repos"`
}

type ReportSummary struct {
    ReposScanned        int `json:"reposScanned"`
    DirtyRepos          int `json:"dirtyRepos"`
    TestFailures        int `json:"testFailures"`
    LintFailures        int `json:"lintFailures"`
    DependencyManifests int `json:"dependencyManifests"`
}

type RepoReport struct {
    Name        string             `json:"name"`
    Path        string             `json:"path"`
    GitDirty    bool               `json:"gitDirty"`
    GitChanges  int                `json:"gitChanges"`
    TestResult  *CommandResult     `json:"testResult,omitempty"`
    LintResult  *CommandResult     `json:"lintResult,omitempty"`
    Dependency  *DependencySummary `json:"dependency,omitempty"`
    Changelog   *ChangelogSummary  `json:"changelog,omitempty"`
    Errors      []string           `json:"errors,omitempty"`
}

func BuildReportData(cfg Config) Report {
    generatedAt := time.Now().Format(time.RFC3339)
    report := Report{GeneratedAt: generatedAt}
    for _, repo := range cfg.Repos {
        scan := ScanRepo(repo)
        entry := RepoReport{
            Name:       repo.Name,
            Path:       repo.Path,
            GitDirty:   scan.GitDirty,
            GitChanges: scan.GitChanges,
            TestResult: scan.TestResult,
            LintResult: scan.LintResult,
            Dependency: scan.Dependency,
            Changelog:  scan.Changelog,
            Errors:     scan.Errors,
        }
        report.Repos = append(report.Repos, entry)

        if scan.GitDirty {
            report.Summary.DirtyRepos++
        }
        if scan.TestResult != nil && scan.TestResult.ExitCode != 0 {
            report.Summary.TestFailures++
        }
        if scan.LintResult != nil && scan.LintResult.ExitCode != 0 {
            report.Summary.LintFailures++
        }
        if scan.Dependency != nil {
            report.Summary.DependencyManifests++
        }
    }
    report.Summary.ReposScanned = len(cfg.Repos)
    return report
}

func RenderMarkdownReport(report Report) string {
    var sb strings.Builder
    sb.WriteString("# Weekly Repo Health Report\n\n")
    sb.WriteString(fmt.Sprintf("Generated: %s\n\n", report.GeneratedAt))

    sb.WriteString("## Summary\n")
    sb.WriteString(fmt.Sprintf("- Repos scanned: %d\n", report.Summary.ReposScanned))
    sb.WriteString(fmt.Sprintf("- Dirty repos: %d\n", report.Summary.DirtyRepos))
    sb.WriteString(fmt.Sprintf("- Test failures: %d\n", report.Summary.TestFailures))
    sb.WriteString(fmt.Sprintf("- Lint failures: %d\n", report.Summary.LintFailures))
    sb.WriteString(fmt.Sprintf("- Dependency manifests detected: %d\n\n", report.Summary.DependencyManifests))

    sb.WriteString("## Repos\n")
    for _, repo := range report.Repos {
        sb.WriteString(fmt.Sprintf("- %s — path: %s\n", repo.Name, repo.Path))
        if repo.GitDirty {
            sb.WriteString(fmt.Sprintf("  - git: %d changes\n", repo.GitChanges))
        } else {
            sb.WriteString("  - git: clean\n")
        }
        if repo.TestResult != nil {
            sb.WriteString(fmt.Sprintf("  - tests: exit=%d (%dms)\n", repo.TestResult.ExitCode, repo.TestResult.DurationMs))
        }
        if repo.LintResult != nil {
            sb.WriteString(fmt.Sprintf("  - lint: exit=%d (%dms)\n", repo.LintResult.ExitCode, repo.LintResult.DurationMs))
        }
        if repo.Dependency != nil {
            sb.WriteString(fmt.Sprintf("  - deps: %s (direct=%d, dev=%d)\n", repo.Dependency.Manager, repo.Dependency.DirectCount, repo.Dependency.DevCount))
        } else {
            sb.WriteString("  - deps: none detected\n")
        }
        if repo.Changelog != nil {
            sb.WriteString(fmt.Sprintf("  - changelog: %d commits (%s)\n", repo.Changelog.CommitCount, repo.Changelog.Range))
            if len(repo.Changelog.Highlights) > 0 {
                for _, highlight := range repo.Changelog.Highlights {
                    sb.WriteString(fmt.Sprintf("    - %s\n", highlight))
                }
            }
        }
        for _, err := range repo.Errors {
            sb.WriteString(fmt.Sprintf("  - error: %s\n", err))
        }
    }

    return sb.String()
}

func RenderJSONReport(report Report) ([]byte, error) {
    return json.MarshalIndent(report, "", "  ")
}
