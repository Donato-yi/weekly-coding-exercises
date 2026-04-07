package src

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

const defaultConfigPath = "docs/config.example.json"

func NewRootCommand() *cobra.Command {
	root := &cobra.Command{
		Use:   "repo-health",
		Short: "Repo health automation CLI",
		Long:  "A CLI that scans repos and generates weekly health reports.",
	}

	root.PersistentFlags().StringP("config", "c", defaultConfigPath, "Path to config JSON")

	root.AddCommand(NewInitCommand())
	root.AddCommand(NewScanCommand())
	root.AddCommand(NewReportCommand())

	root.SetHelpTemplate(helpTemplate())

	return root
}

func helpTemplate() string {
	return `{{with or .Long .Short }}{{.}}{{end}}

Usage:
  {{.UseLine}}

Commands:
{{range .Commands}}{{if (and .IsAvailableCommand (not .IsHelpCommand))}}  {{rpad .Name .NamePadding }} {{.Short}}
{{end}}{{end}}

Flags:
{{.LocalFlags.FlagUsages | trimTrailingWhitespaces}}

Examples:
  repo-health init --output docs/config.local.json
  repo-health scan --config docs/config.example.json
  repo-health report --out demos/weekly-report.md
`
}

func getConfigPath(cmd *cobra.Command) (string, error) {
	path, err := cmd.Flags().GetString("config")
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", fmt.Errorf("config path is required")
	}
	if _, err := os.Stat(path); err != nil {
		return "", fmt.Errorf("config not found: %s", path)
	}
	return path, nil
}
