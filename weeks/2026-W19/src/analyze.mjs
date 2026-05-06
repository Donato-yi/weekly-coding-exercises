const PROMPT_RISK_RULES = [
  {
    id: 'prompt-ignore-prior',
    severity: 'high',
    pattern: /ignore (all )?(previous|prior) (instructions|system prompts?)/i,
    message: 'Prompt attempts to override earlier instructions.',
    recommendation: 'Keep system and operator constraints explicit, and reject variants that tell the agent to ignore prior guidance.',
  },
  {
    id: 'prompt-bypass-approval',
    severity: 'high',
    pattern: /(bypass|skip|avoid) (the )?approval|without approval/i,
    message: 'Prompt suggests bypassing approval boundaries.',
    recommendation: 'Require explicit human approval rules in the prompt and treat bypass language as a policy violation.',
  },
  {
    id: 'prompt-unbounded-exec',
    severity: 'moderate',
    pattern: /(run|execute).*(any|arbitrary).*(command|shell|script)|direct shell access/i,
    message: 'Prompt encourages broad command execution.',
    recommendation: 'Narrow tool scope and list allowed command classes instead of granting open-ended shell autonomy.',
  },
  {
    id: 'prompt-secrets',
    severity: 'moderate',
    pattern: /(print|dump|expose|reveal).*(secret|token|credential|env)/i,
    message: 'Prompt asks for secret or credential exposure.',
    recommendation: 'Strip secret-handling requests from prompts and move sensitive inspection behind explicit human review.',
  },
];

const COMMAND_RISK_RULES = [
  {
    id: 'cmd-destructive-delete',
    category: 'destructive',
    severity: 'high',
    tokens: ['rm -rf', 'del /f', 'remove-item -recurse -force', 'format '],
    recommendation: 'Require human review for destructive file-system commands and validate the target path first.',
  },
  {
    id: 'cmd-network-fetch',
    category: 'network',
    severity: 'moderate',
    tokens: ['curl ', 'wget ', 'invoke-webrequest', 'irm ', 'invoke-restmethod'],
    recommendation: 'Log the destination, expected payload, and approval requirements for outbound network calls.',
  },
  {
    id: 'cmd-permissions',
    category: 'permissions',
    severity: 'moderate',
    tokens: ['chmod 777', 'sudo ', 'takeown ', 'icacls '],
    recommendation: 'Prefer least-privilege command variants and capture why elevated access was needed.',
  },
];

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
  const commandFindings = toolCalls.flatMap((step) => detectCommandRisks(step.command, step.index));
  const promptSignals = extractPromptSignals(trace);
  const promptFindings = detectPromptRisks(promptSignals.promptText);
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
    promptSignals,
    promptFindings,
    commandFindings,
    steps,
    summary: {
      stepCount: steps.length,
      toolCallCount: toolCalls.length,
      uniqueTools: tools,
      failureCount: failures.length,
      retryCount: retries.reduce((total, step) => total + step.retryCount, 0),
      approvalCount: approvalSteps.length,
      riskyCommandCount: commandFindings.length,
      riskyPromptCount: promptFindings.length,
      durationMs,
    },
  };
}

export function evaluateTrace(parsed) {
  const warnings = [];
  const recommendations = [];
  const ruleHits = [];
  const { summary, steps, metadata, commandFindings, promptFindings, promptSignals } = parsed;

  if (summary.failureCount > 0) {
    pushFinding(ruleHits, warnings, {
      id: 'run-failures',
      category: 'reliability',
      severity: summary.failureCount >= 2 ? 'high' : 'moderate',
      message: `${summary.failureCount} step(s) failed during the run.`,
    });
    recommendations.push('Inspect the failing steps and capture whether the issue is prompt design, tool access, or flaky infrastructure.');
  }

  if (summary.retryCount >= 2) {
    pushFinding(ruleHits, warnings, {
      id: 'run-retries',
      category: 'reliability',
      severity: summary.retryCount >= 4 ? 'high' : 'moderate',
      message: `Run required ${summary.retryCount} retries, which suggests low-confidence execution.`,
    });
    recommendations.push('Add intermediate validation or narrower tool scopes before automatic retries.');
  }

  if (summary.approvalCount >= 2) {
    pushFinding(ruleHits, warnings, {
      id: 'run-approvals',
      category: 'approval',
      severity: 'moderate',
      message: `Run crossed ${summary.approvalCount} approval-gated step(s).`,
    });
    recommendations.push('Review whether approval-heavy work should be pre-authorized or split into clearer phases.');
  }

  if (commandFindings.length > 0) {
    const grouped = groupBy(commandFindings, (item) => item.category);
    for (const [category, items] of Object.entries(grouped)) {
      const commands = items.map((item) => item.command).join('; ');
      pushFinding(ruleHits, warnings, {
        id: `cmd-${category}`,
        category,
        severity: maxSeverity(items.map((item) => item.severity)),
        message: `Detected ${items.length} ${category} command risk(s): ${commands}`,
      });
    }

    for (const finding of uniqueBy(commandFindings, (item) => item.id)) {
      recommendations.push(finding.recommendation);
    }
  }

  if (promptFindings.length > 0) {
    for (const finding of promptFindings) {
      pushFinding(ruleHits, warnings, {
        id: finding.id,
        category: 'prompt',
        severity: finding.severity,
        message: finding.message,
      });
      recommendations.push(finding.recommendation);
    }
  }

  const longSteps = steps.filter((step) => step.durationMs >= 20000);
  if (longSteps.length > 0) {
    pushFinding(ruleHits, warnings, {
      id: 'run-long-steps',
      category: 'latency',
      severity: 'moderate',
      message: `${longSteps.length} step(s) took longer than 20 seconds.`,
    });
    recommendations.push('Consider progress checkpoints for long-running tasks so stalled runs are easier to distinguish from productive ones.');
  }

  if (metadata.outcome !== 'success' && !recommendations.some((item) => item.includes('failing steps'))) {
    recommendations.push('Compare this run against a known-good trace before changing the prompt.');
  }

  if (!promptSignals.promptText) {
    recommendations.push('Capture the effective prompt text in future traces so prompt-risk checks can explain tool behavior more directly.');
  }

  const score = clamp(
    100
      - summary.failureCount * 18
      - summary.retryCount * 8
      - summary.approvalCount * 5
      - summary.riskyCommandCount * 10
      - summary.riskyPromptCount * 9
      - Math.min(Math.floor(summary.durationMs / 30000) * 4, 12),
    0,
    100,
  );

  const severity = score >= 85 ? 'low' : score >= 65 ? 'moderate' : 'high';

  return {
    score,
    severity,
    warnings,
    recommendations: [...new Set(recommendations)],
    ruleHits,
  };
}

export function renderMarkdownReport(parsed, evaluation) {
  const { metadata, summary, promptSignals } = parsed;
  const durationSeconds = (summary.durationMs / 1000).toFixed(1);

  return `# Trace Review Report\n\n## Run Metadata\n- Run ID: ${metadata.runId}\n- Agent: ${metadata.agent}\n- Prompt Variant: ${metadata.promptVariant}\n- Outcome: ${metadata.outcome}\n\n## Summary\n- Score: ${evaluation.score} (${evaluation.severity})\n- Steps: ${summary.stepCount}\n- Tool Calls: ${summary.toolCallCount}\n- Unique Tools: ${summary.uniqueTools.join(', ') || 'none'}\n- Failures: ${summary.failureCount}\n- Retries: ${summary.retryCount}\n- Approval Steps: ${summary.approvalCount}\n- Risky Commands: ${summary.riskyCommandCount}\n- Prompt Risks: ${summary.riskyPromptCount}\n- Total Duration: ${durationSeconds}s\n\n## Prompt Signals\n- Prompt Preview: ${promptSignals.preview || 'not captured'}\n- Prompt Length: ${promptSignals.length} char(s)\n\n## Warnings\n${renderBulletList(evaluation.warnings, 'No warnings detected.')}\n\n## Rule Hits\n${renderRuleHits(evaluation.ruleHits)}\n\n## Recommendations\n${renderBulletList(evaluation.recommendations, 'No follow-up actions suggested.')}\n`;
}

export function buildJsonReport(parsed, evaluation) {
  return {
    metadata: parsed.metadata,
    promptSignals: parsed.promptSignals,
    summary: parsed.summary,
    commandFindings: parsed.commandFindings,
    promptFindings: parsed.promptFindings,
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

function extractPromptSignals(trace) {
  const promptParts = [trace.systemPrompt, trace.userPrompt, trace.prompt, trace.instructions]
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim());
  const promptText = promptParts.join('\n\n');
  const preview = promptText ? `${promptText.slice(0, 120).replace(/\s+/g, ' ')}${promptText.length > 120 ? '…' : ''}` : '';

  return {
    length: promptText.length,
    preview,
    promptText,
  };
}

function detectPromptRisks(promptText) {
  if (!promptText) {
    return [];
  }

  return PROMPT_RISK_RULES
    .filter((rule) => rule.pattern.test(promptText))
    .map((rule) => ({
      id: rule.id,
      severity: rule.severity,
      message: rule.message,
      recommendation: rule.recommendation,
    }));
}

function detectCommandRisks(command, stepIndex) {
  if (!command) {
    return [];
  }

  const normalized = command.toLowerCase();
  return COMMAND_RISK_RULES
    .filter((rule) => rule.tokens.some((token) => normalized.includes(token)))
    .map((rule) => ({
      id: rule.id,
      category: rule.category,
      severity: rule.severity,
      command,
      stepIndex,
      recommendation: rule.recommendation,
    }));
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

function renderRuleHits(ruleHits) {
  if (!ruleHits.length) {
    return '- No rule hits.';
  }

  return ruleHits.map((item) => `- [${item.id}] (${item.severity}/${item.category}) ${item.message}`).join('\n');
}

function pushFinding(ruleHits, warnings, finding) {
  ruleHits.push(finding);
  warnings.push(finding.message);
}

function groupBy(items, selector) {
  return items.reduce((groups, item) => {
    const key = selector(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function uniqueBy(items, selector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = selector(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function maxSeverity(levels) {
  if (levels.includes('high')) {
    return 'high';
  }
  if (levels.includes('moderate')) {
    return 'moderate';
  }
  return 'low';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
