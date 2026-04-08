package src

import (
    "context"
    "errors"
    "os/exec"
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

type RepoScan struct {
    Repo       RepoConfig
    GitDirty   bool
    GitChanges int
    TestResult *CommandResult
    LintResult *CommandResult
    Errors     []string
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

    return scan
}
