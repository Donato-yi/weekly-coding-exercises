package src

import (
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "strings"
    "time"
)

type CommandResult struct {
    Command    string
    Args       []string
    ExitCode   int
    Output     string
    Error      string
    DurationMs int64
}

type DependencySummary struct {
    Manager     string
    DirectCount int
    DevCount    int
    Notes       string
}

type ChangelogSummary struct {
    Range       string
    CommitCount int
    Highlights  []string
}

type RepoScan struct {
    Repo        RepoConfig
    GitDirty    bool
    GitChanges  int
    TestResult  *CommandResult
    LintResult  *CommandResult
    Dependency *DependencySummary
    Changelog   *ChangelogSummary
    Errors      []string
}

func SplitCommand(command string) (string, []string) {
    fields := strings.Fields(command)
    if len(fields) == 0 {
        return "", nil
    }
    return fields[0], fields[1:]
}

func ParseGitStatusOutput(output string) (bool, int) {
    lines := strings.Split(strings.TrimSpace(output), "\n")
    if len(lines) == 1 && lines[0] == "" {
        return false, 0
    }
    count := 0
    for _, line := range lines {
        if strings.TrimSpace(line) == "" {
            continue
        }
        count++
    }
    return count > 0, count
}

func ParseGitLogOutput(output string) []string {
    lines := strings.Split(strings.TrimSpace(output), "\n")
    var cleaned []string
    for _, line := range lines {
        trimmed := strings.TrimSpace(line)
        if trimmed == "" {
            continue
        }
        cleaned = append(cleaned, trimmed)
    }
    return cleaned
}

func SummarizeGitLog(output string, maxHighlights int) (int, []string) {
    lines := ParseGitLogOutput(output)
    count := len(lines)
    if count == 0 {
        return 0, nil
    }
    if maxHighlights > count {
        maxHighlights = count
    }
    return count, lines[:maxHighlights]
}

func ParseGoModDependencies(content string) int {
    lines := strings.Split(content, "\n")
    inBlock := false
    count := 0
    for _, line := range lines {
        trimmed := strings.TrimSpace(line)
        if strings.HasPrefix(trimmed, "require (") {
            inBlock = true
            continue
        }
        if inBlock && trimmed == ")" {
            inBlock = false
            continue
        }
        if strings.HasPrefix(trimmed, "require ") && !inBlock {
            fields := strings.Fields(trimmed)
            if len(fields) >= 2 {
                count++
            }
            continue
        }
        if inBlock {
            if trimmed == "" || strings.HasPrefix(trimmed, "//") {
                continue
            }
            fields := strings.Fields(trimmed)
            if len(fields) >= 1 {
                count++
            }
        }
    }
    return count
}

func ParseRequirementsDependencies(content string) int {
    lines := strings.Split(content, "\n")
    count := 0
    for _, line := range lines {
        trimmed := strings.TrimSpace(line)
        if trimmed == "" || strings.HasPrefix(trimmed, "#") {
            continue
        }
        count++
    }
    return count
}

func ParsePackageJSONDependencies(content string) (int, int, error) {
    var payload struct {
        Dependencies    map[string]string `json:"dependencies"`
        DevDependencies map[string]string `json:"devDependencies"`
    }
    if err := json.Unmarshal([]byte(content), &payload); err != nil {
        return 0, 0, err
    }
    return len(payload.Dependencies), len(payload.DevDependencies), nil
}

func RunCommandInDir(dir, command string, args []string, timeout time.Duration) (CommandResult, error) {
    if command == "" {
        return CommandResult{}, errors.New("command is empty")
    }
    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()

    started := time.Now()
    cmd := exec.CommandContext(ctx, command, args...)
    cmd.Dir = dir
    output, err := cmd.CombinedOutput()

    result := CommandResult{
        Command:    command,
        Args:       args,
        ExitCode:   0,
        Output:     strings.TrimSpace(string(output)),
        DurationMs: time.Since(started).Milliseconds(),
    }

    if err != nil {
        result.Error = err.Error()
        if exitErr, ok := err.(*exec.ExitError); ok {
            result.ExitCode = exitErr.ExitCode()
        } else if errors.Is(ctx.Err(), context.DeadlineExceeded) {
            result.ExitCode = -1
        } else {
            result.ExitCode = 1
        }
        return result, err
    }

    return result, nil
}

func GitStatus(repoPath string) (bool, int, error) {
    output, err := RunCommandInDir(repoPath, "git", []string{"status", "--porcelain"}, 15*time.Second)
    if err != nil && output.Output == "" {
        return false, 0, err
    }
    dirty, count := ParseGitStatusOutput(output.Output)
    return dirty, count, nil
}

func DependencyAudit(repoPath string) (*DependencySummary, error) {
    goModPath := filepath.Join(repoPath, "go.mod")
    if content, err := os.ReadFile(goModPath); err == nil {
        count := ParseGoModDependencies(string(content))
        return &DependencySummary{
            Manager:     "go",
            DirectCount: count,
            Notes:       "parsed go.mod",
        }, nil
    }

    packageJSON := filepath.Join(repoPath, "package.json")
    if content, err := os.ReadFile(packageJSON); err == nil {
        direct, dev, err := ParsePackageJSONDependencies(string(content))
        if err != nil {
            return nil, err
        }
        return &DependencySummary{
            Manager:     "npm",
            DirectCount: direct,
            DevCount:    dev,
            Notes:       "parsed package.json",
        }, nil
    }

    requirementsPath := filepath.Join(repoPath, "requirements.txt")
    if content, err := os.ReadFile(requirementsPath); err == nil {
        count := ParseRequirementsDependencies(string(content))
        return &DependencySummary{
            Manager:     "pip",
            DirectCount: count,
            Notes:       "parsed requirements.txt",
        }, nil
    }

    pyprojectPath := filepath.Join(repoPath, "pyproject.toml")
    if _, err := os.Stat(pyprojectPath); err == nil {
        return &DependencySummary{
            Manager: "python",
            Notes:   "pyproject.toml detected (manual review)",
        }, nil
    }

    return nil, nil
}

func ChangelogSummary(repoPath string, days int) (*ChangelogSummary, error) {
    result, err := RunCommandInDir(repoPath, "git", []string{"log", fmt.Sprintf("--since=%d.days", days), "--pretty=format:%s"}, 15*time.Second)
    if err != nil && result.Output == "" {
        return nil, err
    }
    count, highlights := SummarizeGitLog(result.Output, 3)
    if count == 0 {
        return &ChangelogSummary{
            Range:       fmt.Sprintf("last %d days", days),
            CommitCount: 0,
        }, nil
    }
    return &ChangelogSummary{
        Range:       fmt.Sprintf("last %d days", days),
        CommitCount: count,
        Highlights:  highlights,
    }, nil
}

func ScanRepo(repo RepoConfig) RepoScan {
    scan := RepoScan{Repo: repo}

    dirty, changes, err := GitStatus(repo.Path)
    if err != nil {
        scan.Errors = append(scan.Errors, "git status: "+err.Error())
    } else {
        scan.GitDirty = dirty
        scan.GitChanges = changes
    }

    if repo.TestCommand != "" {
        cmd, args := SplitCommand(repo.TestCommand)
        if cmd == "" {
            scan.Errors = append(scan.Errors, "test command empty")
        } else {
            result, err := RunCommandInDir(repo.Path, cmd, args, 60*time.Second)
            scan.TestResult = &result
            if err != nil {
                scan.Errors = append(scan.Errors, "tests: "+err.Error())
            }
        }
    }

    if repo.LintCommand != "" {
        cmd, args := SplitCommand(repo.LintCommand)
        if cmd == "" {
            scan.Errors = append(scan.Errors, "lint command empty")
        } else {
            result, err := RunCommandInDir(repo.Path, cmd, args, 60*time.Second)
            scan.LintResult = &result
            if err != nil {
                scan.Errors = append(scan.Errors, "lint: "+err.Error())
            }
        }
    }

    deps, err := DependencyAudit(repo.Path)
    if err != nil {
        scan.Errors = append(scan.Errors, "deps: "+err.Error())
    } else {
        scan.Dependency = deps
    }

    changelog, err := ChangelogSummary(repo.Path, 7)
    if err != nil {
        scan.Errors = append(scan.Errors, "changelog: "+err.Error())
    } else {
        scan.Changelog = changelog
    }

    return scan
}
