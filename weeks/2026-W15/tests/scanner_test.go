package tests

import (
    "testing"

    week15 "week15/src"
)

func TestParseGitStatusOutput(t *testing.T) {
    dirty, count := week15.ParseGitStatusOutput(" M main.go\n?? new.txt\n")
    if !dirty {
        t.Fatalf("expected dirty to be true")
    }
    if count != 2 {
        t.Fatalf("expected 2 changes, got %d", count)
    }

    dirty, count = week15.ParseGitStatusOutput("\n")
    if dirty || count != 0 {
        t.Fatalf("expected clean status")
    }
}

func TestSplitCommand(t *testing.T) {
    cmd, args := week15.SplitCommand("go test ./...")
    if cmd != "go" {
        t.Fatalf("expected go, got %s", cmd)
    }
    if len(args) != 2 {
        t.Fatalf("expected 2 args, got %d", len(args))
    }

    cmd, args = week15.SplitCommand("  ")
    if cmd != "" || args != nil {
        t.Fatalf("expected empty command")
    }
}

func TestParseGoModDependencies(t *testing.T) {
    content := `module example

require (
    github.com/spf13/cobra v1.8.0
    github.com/stretchr/testify v1.8.2
)
`
    count := week15.ParseGoModDependencies(content)
    if count != 2 {
        t.Fatalf("expected 2 dependencies, got %d", count)
    }
}

func TestParsePackageJSONDependencies(t *testing.T) {
    content := `{"dependencies":{"react":"18.0.0"},"devDependencies":{"vitest":"1.0.0","eslint":"8.0.0"}}`
    direct, dev, err := week15.ParsePackageJSONDependencies(content)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if direct != 1 || dev != 2 {
        t.Fatalf("expected 1 direct and 2 dev dependencies, got %d and %d", direct, dev)
    }
}

func TestSummarizeGitLog(t *testing.T) {
    output := "feat: add scanner\nfix: adjust config\nchore: update docs\n"
    count, highlights := week15.SummarizeGitLog(output, 2)
    if count != 3 {
        t.Fatalf("expected 3 commits, got %d", count)
    }
    if len(highlights) != 2 {
        t.Fatalf("expected 2 highlights, got %d", len(highlights))
    }
}
