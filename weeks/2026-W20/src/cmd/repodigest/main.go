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
	case "review":
		runReview(os.Args[2:])
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
	tag := fs.String("tag", "", "optional tag filter")
	outputPath := fs.String("output", "", "optional file path to write the rendered report")
	fs.Parse(args)

	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	summary := app.BuildFilteredSummary(cfg, time.Now(), model.Filter{
		Kind: *kind,
		Risk: *risk,
		Tag:  *tag,
	})

	var out string
	switch strings.ToLower(strings.TrimSpace(*format)) {
	case "markdown", "md":
		out = app.RenderMarkdown(summary)
	case "json":
		rendered, err := app.RenderJSON(summary)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
		out = rendered
	default:
		fmt.Fprintf(os.Stderr, "error: unsupported format %q\n", *format)
		os.Exit(1)
	}

	if err := app.WriteOutput(*outputPath, out); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	fmt.Print(out)
}

func runReview(args []string) {
	fs := flag.NewFlagSet("review", flag.ExitOnError)
	configPath := fs.String("config", "demos/sample-config.json", "path to config file")
	outputPath := fs.String("output", "", "optional file path to write the rendered review")
	fs.Parse(args)

	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	review := app.RenderReview(app.BuildSummary(cfg, time.Now()))
	if err := app.WriteOutput(*outputPath, review); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	fmt.Print(review)
}

func printUsage() {
	fmt.Println("repodigest <command>")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  summarize   Alias for report --format markdown")
	fmt.Println("  report      Load a config file and print markdown or JSON output")
	fmt.Println("  review      Render an action-oriented maintenance checklist")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  repodigest summarize --config demos/sample-config.json")
	fmt.Println("  repodigest report --format json --risk high")
	fmt.Println("  repodigest report --kind github --tag security --format markdown")
	fmt.Println("  repodigest report --format json --output demos/generated/sample-summary.json")
	fmt.Println("  repodigest report --tag backend --output demos/generated/backend-summary.md")
	fmt.Println("  repodigest review --output demos/generated/review-checklist.md")
}
