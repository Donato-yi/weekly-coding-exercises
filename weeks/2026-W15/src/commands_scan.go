package src

import (
	"fmt"
	"time"

	"github.com/spf13/cobra"
)

func NewScanCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "scan",
		Short: "Scan repo health signals (placeholder)",
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
				fmt.Fprintf(cmd.OutOrStdout(), "- %s (%s): queued\n", repo.Name, repo.Path)
			}
			fmt.Fprintln(cmd.OutOrStdout(), "Scan complete (stub).")
			return nil
		},
	}
	return cmd
}
