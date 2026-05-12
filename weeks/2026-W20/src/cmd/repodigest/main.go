package main

import (
	"flag"
	"fmt"
	"os"
	"time"

	"repodigest/internal/app"
	"repodigest/internal/config"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "summarize":
		runSummarize(os.Args[2:])
	case "help", "--help", "-h":
		printUsage()
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n\n", os.Args[1])
		printUsage()
		os.Exit(1)
	}
}

func runSummarize(args []string) {
	fs := flag.NewFlagSet("summarize", flag.ExitOnError)
	configPath := fs.String("config", "demos/sample-config.json", "path to config file")
	fs.Parse(args)

	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	summary := app.BuildSummary(cfg, time.Now())
	fmt.Print(app.RenderMarkdown(summary))
}

func printUsage() {
	fmt.Println("repodigest <command>")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  summarize   Load a config file and print a markdown summary")
}
