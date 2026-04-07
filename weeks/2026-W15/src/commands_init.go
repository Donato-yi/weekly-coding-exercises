package src

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

func NewInitCommand() *cobra.Command {
	var output string
	cmd := &cobra.Command{
		Use:   "init",
		Short: "Create a starter config file",
		RunE: func(cmd *cobra.Command, args []string) error {
			if output == "" {
				output = "docs/config.local.json"
			}
			cfg := SampleConfig()
			payload, err := json.MarshalIndent(cfg, "", "  ")
			if err != nil {
				return err
			}
			if err := os.WriteFile(output, payload, 0o644); err != nil {
				return err
			}
			fmt.Fprintf(cmd.OutOrStdout(), "Wrote config to %s\n", output)
			return nil
		},
	}
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output path for config")
	return cmd
}
