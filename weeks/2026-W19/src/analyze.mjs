export function parseTrace(input) {
  const trace = typeof input === 'string' ? JSON.parse(input) : structuredClone(input);
  if (!trace || typeof trace !== 'object') {
    throw new Error('Trace must be an object.');
  }

  const steps = Array.isArray(trace.steps) ? trace.steps.map(normalizeStep) : [];
  const toolCalls = steps.filter((step) => step.kind === 'tool');
  const failures = steps.filter((step) => step.status === 'failed');
  const approvalSteps = steps.filter((step) => step.requiresApproval);
  const retries = steps.filter((step) => step.retryCount > 0);
  const riskyCommands = toolCalls.filter((step) => isRiskyCommand(step.command));
  const tools = [...new Set(toolCalls.map((step) => step.toolName).filter(Boolean))];
  const durationMs = steps.reduce((total, step) => total + step.durationMs, 0);

  return {
    metadata: {
      runId: trace.runId ?? 'unknown-run',
      agent: trace.agent ?? 'unknown-agent',
      promptVariant: trace.promptVariant ?? 'default',
      startedAt: trace.startedAt ?? null,
      finishedAt: trace.finishedAt ?? null,
      outcome: trace.outcome ?? inferOutcome(failures.length),
    },
    steps,
    summary: {
      stepCount: steps.length,
      toolCallCount: toolCalls.length,
      uniqueTools: tools,
      failureCount: failures.length,
      retryCount: retries.reduce((total, step) => total + step.retryCount, 0),
      approvalCount: approvalSteps.length,
      riskyCommandCount: riskyCommands.length,
      durationMs,
    },
  };
}

export function evaluateTrace(parsed) {
  const warnings = [];
  const recommendations = [];
  const { summary, steps, metadata } = parsed;

  if (summary.failureCount > 0) {
    warnings.push(`${summary.failureCount} step(s) failed during the run.`);
    recommendations.push('Inspect the failing steps and capture whether the issue is prompt design, tool access, or flaky infrastructure.');
  }

  if (summary.retryCount >= 2) {
    warnings.push(`Run required ${summary.retryCount} retries, which suggests low-confidence execution.`);
    recommendations.push('Add intermediate validation or narrower tool scopes before automatic retries.');
  }

  if (summary.approvalCount >= 2) {
    warnings.push(`Run crossed ${summary.approvalCount} approval-gated step(s).`);
    recommendations.push('Review whether approval-heavy work should be pre-authorized or split into clearer phases.');
  }

  const riskyCommands = steps.filter((step) => step.kind === 'tool' && isRiskyCommand(step.command));
  if (riskyCommands.length > 0) {
    warnings.push(`Detected ${riskyCommands.length} potentially risky command(s): ${riskyCommands.map((step) => step.command).join('; ')}`);
    recommendations.push('Require human review for destructive or network-sensitive shell commands.');
  }

  const longSteps = steps.filter((step) => step.durationMs >= 20000);
  if (longSteps.length > 0) {
    warnings.push(`${longSteps.length} step(s) took longer than 20 seconds.`);
    recommendations.push('Consider progress checkpoints for long-running tasks so stalled runs are easier to distinguish from productive ones.');
  }

  if (metadata.outcome !== 'success' && !recommendations.some((item) => item.includes('failing steps'))) {
    recommendations.push('Compare this run against a known-good trace before changing the prompt.');
  }

  const score = clamp(
    100
      - summary.failureCount * 18
      - summary.retryCount * 8
      - summary.approvalCount * 5
      - summary.riskyCommandCount * 12
      - Math.min(Math.floor(summary.durationMs / 30000) * 4, 12),
    0,
    100,
  );

  const severity = score >= 85 ? 'low' : score >= 65 ? 'moderate' : 'high';

  return {
    score,
    severity,
    warnings,
    recommendations,
  };
}

export function renderMarkdownReport(parsed, evaluation) {
  const { metadata, summary } = parsed;
  const durationSeconds = (summary.durationMs / 1000).toFixed(1);

  return `# Trace Review Report\n\n## Run Metadata\n- Run ID: ${metadata.runId}\n- Agent: ${metadata.agent}\n- Prompt Variant: ${metadata.promptVariant}\n- Outcome: ${metadata.outcome}\n\n## Summary\n- Score: ${evaluation.score} (${evaluation.severity})\n- Steps: ${summary.stepCount}\n- Tool Calls: ${summary.toolCallCount}\n- Unique Tools: ${summary.uniqueTools.join(', ') || 'none'}\n- Failures: ${summary.failureCount}\n- Retries: ${summary.retryCount}\n- Approval Steps: ${summary.approvalCount}\n- Risky Commands: ${summary.riskyCommandCount}\n- Total Duration: ${durationSeconds}s\n\n## Warnings\n${renderBulletList(evaluation.warnings, 'No warnings detected.')}\n\n## Recommendations\n${renderBulletList(evaluation.recommendations, 'No follow-up actions suggested.')}\n`;
}

export function buildJsonReport(parsed, evaluation) {
  return {
    metadata: parsed.metadata,
    summary: parsed.summary,
    evaluation,
  };
}

function normalizeStep(step, index) {
  return {
    index,
    kind: step.kind ?? 'note',
    toolName: step.toolName ?? null,
    command: step.command ?? '',
    status: step.status ?? 'completed',
    durationMs: Number.isFinite(step.durationMs) ? step.durationMs : 0,
    retryCount: Number.isFinite(step.retryCount) ? step.retryCount : 0,
    requiresApproval: Boolean(step.requiresApproval),
    notes: step.notes ?? '',
  };
}

function inferOutcome(failureCount) {
  return failureCount > 0 ? 'warning' : 'success';
}

function renderBulletList(items, fallback) {
  if (!items.length) {
    return `- ${fallback}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function isRiskyCommand(command) {
  if (!command) {
    return false;
  }

  const normalized = command.toLowerCase();
  return ['rm -rf', 'curl ', 'invoke-webrequest', 'chmod 777', 'del /f', 'format '].some((token) => normalized.includes(token));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
