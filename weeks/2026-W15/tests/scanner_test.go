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
