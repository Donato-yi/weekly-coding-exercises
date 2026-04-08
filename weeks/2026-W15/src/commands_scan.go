package src

import (
	"fmt"
	"time"

	"github.com/spf13/cobra"
)

func NewScanCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "scan",
		Short: "Scan repo health signals",
		RunE: func(cmd *cobra.Command, args []string) error {
			configPath, err := getConfigPath(cmd)
			if err != nil {
				return err
			}
			cfg, err := LoadConfig(configPath)
			if err != nil {
				return err
			}
			fmt.Fprintf(cmd.OutOrStdout(), "Scan started (%s)\n", time.Now().Format(time.RFC3339))
			for _, repo := range cfg.Repos {
				scan := ScanRepo(repo)
				fmt.Fprintf(cmd.OutOrStdout(), "- %s (%s)\n", repo.Name, repo.Path)
				if scan.GitDirty {
					fmt.Fprintf(cmd.OutOrStdout(), "  - git: %d changes\n", scan.GitChanges)
				} else {
					fmt.Fprintln(cmd.OutOrStdout(), "  - git: clean")
				}
				if scan.TestResult != nil {
					fmt.Fprintf(cmd.OutOrStdout(), "  - tests: exit=%d (%dms)\n", scan.TestResult.ExitCode, scan.TestResult.DurationMs)
				}
				if scan.LintResult != nil {
					fmt.Fprintf(cmd.OutOrStdout(), "  - lint: exit=%d (%dms)\n", scan.LintResult.ExitCode, scan.LintResult.DurationMs)
				}
				for _, err := range scan.Errors {
					fmt.Fprintf(cmd.OutOrStdout(), "  - error: %s\n", err)
				}
			}
			fmt.Fprintln(cmd.OutOrStdout(), "Scan complete.")
			return nil
		},
	}
	return cmd
}
