package src

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

func NewReportCommand() *cobra.Command {
	var outPath string
	cmd := &cobra.Command{
		Use:   "report",
		Short: "Generate a weekly health report (placeholder)",
		RunE: func(cmd *cobra.Command, args []string) error {
			configPath, err := getConfigPath(cmd)
			if err != nil {
				return err
			}
			cfg, err := LoadConfig(configPath)
			if err != nil {
				return err
			}
			if outPath == "" {
				outPath = filepath.Join(cfg.Report.OutputDir, "weekly-report.md")
			}
			if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
				return err
			}
			report := buildReport(cfg)
			if err := os.WriteFile(outPath, []byte(report), 0o644); err != nil {
				return err
			}
			fmt.Fprintf(cmd.OutOrStdout(), "Report written to %s\n", outPath)
			return nil
		},
	}
	cmd.Flags().StringVarP(&outPath, "out", "o", "", "Output path for report")
	return cmd
}

func buildReport(cfg Config) string {
	var sb strings.Builder
	generatedAt := time.Now().Format(time.RFC3339)
	var dirtyCount int
	var failingTests int
	var failingLint int
	var depsCount int

	sb.WriteString("# Weekly Repo Health Report\n\n")
	sb.WriteString(fmt.Sprintf("Generated: %s\n\n", generatedAt))
	sb.WriteString("## Repos\n")
	for _, repo := range cfg.Repos {
		scan := ScanRepo(repo)
		sb.WriteString(fmt.Sprintf("- %s — path: %s\n", repo.Name, repo.Path))
		if scan.GitDirty {
			dirtyCount++
			sb.WriteString(fmt.Sprintf("  - git: %d changes\n", scan.GitChanges))
		} else {
			sb.WriteString("  - git: clean\n")
		}
		if scan.TestResult != nil {
			sb.WriteString(fmt.Sprintf("  - tests: exit=%d (%dms)\n", scan.TestResult.ExitCode, scan.TestResult.DurationMs))
			if scan.TestResult.ExitCode != 0 {
				failingTests++
			}
		}
		if scan.LintResult != nil {
			sb.WriteString(fmt.Sprintf("  - lint: exit=%d (%dms)\n", scan.LintResult.ExitCode, scan.LintResult.DurationMs))
			if scan.LintResult.ExitCode != 0 {
				failingLint++
			}
		}
		if scan.Dependency != nil {
			depsCount++
			sb.WriteString(fmt.Sprintf("  - deps: %s (direct=%d, dev=%d)\n", scan.Dependency.Manager, scan.Dependency.DirectCount, scan.Dependency.DevCount))
		} else {
			sb.WriteString("  - deps: none detected\n")
		}
		if scan.Changelog != nil {
			sb.WriteString(fmt.Sprintf("  - changelog: %d commits (%s)\n", scan.Changelog.CommitCount, scan.Changelog.Range))
			if len(scan.Changelog.Highlights) > 0 {
				for _, highlight := range scan.Changelog.Highlights {
					sb.WriteString(fmt.Sprintf("    - %s\n", highlight))
				}
			}
		}
		for _, err := range scan.Errors {
			sb.WriteString(fmt.Sprintf("  - error: %s\n", err))
		}
	}
	
	sb.WriteString("\n## Summary\n")
	sb.WriteString(fmt.Sprintf("- Repos scanned: %d\n", len(cfg.Repos)))
	sb.WriteString(fmt.Sprintf("- Dirty repos: %d\n", dirtyCount))
	sb.WriteString(fmt.Sprintf("- Test failures: %d\n", failingTests))
	sb.WriteString(fmt.Sprintf("- Lint failures: %d\n", failingLint))
	sb.WriteString(fmt.Sprintf("- Dependency manifests detected: %d\n", depsCount))
	return sb.String()
}

// BuildReportForTest exposes report generation for tests.
func BuildReportForTest(cfg Config) string {
	return buildReport(cfg)
}
