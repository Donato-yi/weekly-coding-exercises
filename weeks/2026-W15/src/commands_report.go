package src

import (
    "fmt"
    "os"
    "path/filepath"

    "github.com/spf13/cobra"
)

func NewReportCommand() *cobra.Command {
    var outPath string
    var jsonOutPath string
    cmd := &cobra.Command{
        Use:   "report",
        Short: "Generate a weekly health report",
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
            if jsonOutPath == "" {
                jsonOutPath = filepath.Join(filepath.Dir(outPath), "weekly-report.json")
            }
            if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
                return err
            }

            report := BuildReportData(cfg)
            markdown := RenderMarkdownReport(report)
            if err := os.WriteFile(outPath, []byte(markdown), 0o644); err != nil {
                return err
            }

            jsonPayload, err := RenderJSONReport(report)
            if err != nil {
                return err
            }
            if err := os.WriteFile(jsonOutPath, jsonPayload, 0o644); err != nil {
                return err
            }

            fmt.Fprintf(cmd.OutOrStdout(), "Report written to %s (json: %s)\n", outPath, jsonOutPath)
            return nil
        },
    }
    cmd.Flags().StringVarP(&outPath, "out", "o", "", "Output path for markdown report")
    cmd.Flags().StringVar(&jsonOutPath, "json-out", "", "Output path for JSON report")
    return cmd
}

// BuildReportForTest exposes report generation for tests.
func BuildReportForTest(cfg Config) string {
    report := BuildReportData(cfg)
    return RenderMarkdownReport(report)
}
