package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"repodigest/internal/app"
	"repodigest/internal/config"
	"repodigest/internal/model"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "summarize", "report":
		runReport(os.Args[2:])
	case "help", "--help", "-h":
		printUsage()
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n\n", os.Args[1])
		printUsage()
		os.Exit(1)
	}
}

func runReport(args []string) {
	fs := flag.NewFlagSet("report", flag.ExitOnError)
	configPath := fs.String("config", "demos/sample-config.json", "path to config file")
	format := fs.String("format", "markdown", "output format: markdown or json")
	kind := fs.String("kind", "", "optional source kind filter")
	risk := fs.String("risk", "", "optional risk filter: low, medium, or high")
	fs.Parse(args)

	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	summary := app.BuildFilteredSummary(cfg, time.Now(), model.Filter{
		Kind: *kind,
		Risk: *risk,
	})

	switch strings.ToLower(strings.TrimSpace(*format)) {
	case "markdown", "md":
		fmt.Print(app.RenderMarkdown(summary))
	case "json":
		out, err := app.RenderJSON(summary)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
		fmt.Print(out)
	default:
		fmt.Fprintf(os.Stderr, "error: unsupported format %q\n", *format)
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("repodigest <command>")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  summarize   Alias for report --format markdown")
	fmt.Println("  report      Load a config file and print markdown or JSON output")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  repodigest summarize --config demos/sample-config.json")
	fmt.Println("  repodigest report --format json --risk high")
	fmt.Println("  repodigest report --kind github --format markdown")
}
