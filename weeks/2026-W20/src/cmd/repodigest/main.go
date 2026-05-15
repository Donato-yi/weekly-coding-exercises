package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
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
	case "bundle":
		runBundle(os.Args[2:])
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

func runBundle(args []string) {
	fs := flag.NewFlagSet("bundle", flag.ExitOnError)
	configPath := fs.String("config", "demos/sample-config.json", "path to config file")
	outputDir := fs.String("output-dir", "demos/generated/bundle", "directory for generated artifacts")
	continueOnError := fs.Bool("continue-on-error", false, "keep writing remaining artifacts after a failure and record the outcome in run-status.json")
	fs.Parse(args)

	status := app.BuildRunStatus(*configPath, *outputDir, *continueOnError)

	cfg, err := config.Load(*configPath)
	if err != nil {
		status.Success = false
		status.Errors = append(status.Errors, err.Error())
		if strings.TrimSpace(*outputDir) != "" {
			if writeErr := app.WriteStatus(*outputDir, status); writeErr != nil {
				fmt.Fprintf(os.Stderr, "error: %v\n", err)
				fmt.Fprintf(os.Stderr, "error: %v\n", writeErr)
				os.Exit(1)
			}
		}
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
	status.TeamName = cfg.TeamName

	summary := app.BuildSummary(cfg, time.Now())
	markdown := app.RenderMarkdown(summary)
	jsonOut, jsonErr := app.RenderJSON(summary)
	if jsonErr != nil {
		status.Success = false
		status.Errors = append(status.Errors, fmt.Sprintf("summary.json: %v", jsonErr))
	}
	review := app.RenderReview(summary)

	type artifactSpec struct {
		name    string
		path    string
		format  string
		content string
		skip    bool
		err     error
	}

	artifacts := []artifactSpec{
		{name: "summary.md", path: filepath.Join(*outputDir, "summary.md"), format: "markdown", content: markdown},
		{name: "summary.json", path: filepath.Join(*outputDir, "summary.json"), format: "json", content: jsonOut, err: jsonErr, skip: jsonErr != nil},
		{name: "review.md", path: filepath.Join(*outputDir, "review.md"), format: "markdown", content: review},
	}

	for _, artifact := range artifacts {
		writeErr := artifact.err
		if !artifact.skip && writeErr == nil {
			writeErr = app.WriteOutput(artifact.path, artifact.content)
		}
		app.RecordArtifact(&status, artifact.name, artifact.path, artifact.format, writeErr)
		if writeErr != nil && !*continueOnError {
			break
		}
	}

	if err := app.WriteStatus(*outputDir, status); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	if !status.Success {
		fmt.Fprintf(os.Stderr, "bundle completed with errors; see %s\n", filepath.Join(*outputDir, "run-status.json"))
		os.Exit(1)
	}

	fmt.Printf("bundle wrote %d artifacts to %s\n", len(status.Artifacts), *outputDir)
}

func printUsage() {
	fmt.Println("repodigest <command>")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  summarize   Alias for report --format markdown")
	fmt.Println("  report      Load a config file and print markdown or JSON output")
	fmt.Println("  review      Render an action-oriented maintenance checklist")
	fmt.Println("  bundle      Write a scheduler-friendly artifact set plus run-status.json")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  repodigest summarize --config demos/sample-config.json")
	fmt.Println("  repodigest report --format json --risk high")
	fmt.Println("  repodigest report --kind github --tag security --format markdown")
	fmt.Println("  repodigest report --format json --output demos/generated/sample-summary.json")
	fmt.Println("  repodigest report --tag backend --output demos/generated/backend-summary.md")
	fmt.Println("  repodigest review --output demos/generated/review-checklist.md")
	fmt.Println("  repodigest bundle --config demos/sample-config.json --output-dir demos/generated/daily-run")
}
