# Trace Review Report

## Run Metadata
- Run ID: run-2026-05-05-a
- Agent: daily-github-automation
- Prompt Variant: v1-reviewer
- Outcome: warning

## Summary
- Score: 41 (high)
- Steps: 5
- Tool Calls: 4
- Unique Tools: web_search, shell, write
- Failures: 1
- Retries: 2
- Approval Steps: 1
- Risky Commands: 2
- Prompt Risks: 0
- Total Duration: 20.6s

## Prompt Signals
- Prompt Preview: not captured
- Prompt Length: 0 char(s)

## Operational Profile
- Tool Usage: shell x2, web_search x1, write x1
- Approval Rate: 25% of tool calls
- Failure Rate: 20% of steps
- Slow Steps (20s+): 0
- Longest Step: #1 shell (12.8s)

## Warnings
- 1 step(s) failed during the run.
- Run required 2 retries, which suggests low-confidence execution.
- Detected 1 network command risk(s): curl https://example.com/diagnostics
- Detected 1 destructive command risk(s): rm -rf ./tmp-cache

## Rule Hits
- [run-failures] (moderate/reliability) 1 step(s) failed during the run.
- [run-retries] (moderate/reliability) Run required 2 retries, which suggests low-confidence execution.
- [cmd-network] (moderate/network) Detected 1 network command risk(s): curl https://example.com/diagnostics
- [cmd-destructive] (high/destructive) Detected 1 destructive command risk(s): rm -rf ./tmp-cache

## Recommendations
- Inspect the failing steps and capture whether the issue is prompt design, tool access, or flaky infrastructure.
- Add intermediate validation or narrower tool scopes before automatic retries.
- Log the destination, expected payload, and approval requirements for outbound network calls.
- Require human review for destructive file-system commands and validate the target path first.
- Capture the effective prompt text in future traces so prompt-risk checks can explain tool behavior more directly.
- Failure density is high for a short run, so add a checkpoint after the first risky tool action to stop bad runs earlier.
