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
	sb.WriteString("# Weekly Repo Health Report\n\n")
	sb.WriteString(fmt.Sprintf("Generated: %s\n\n", time.Now().Format(time.RFC3339)))
	sb.WriteString("## Repos\n")
	for _, repo := range cfg.Repos {
		sb.WriteString(fmt.Sprintf("- %s — path: %s\n", repo.Name, repo.Path))
	}
	sb.WriteString("\n## Summary\n")
	sb.WriteString("- Tests: pending\n- Lint: pending\n- Dependencies: pending\n")
	return sb.String()
}

// BuildReportForTest exposes report generation for tests.
func BuildReportForTest(cfg Config) string {
	return buildReport(cfg)
}
