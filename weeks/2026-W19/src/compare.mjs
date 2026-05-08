import { evaluateTrace } from './analyze.mjs';

export function compareTraces(leftTrace, rightTrace) {
  const leftEvaluation = evaluateTrace(leftTrace);
  const rightEvaluation = evaluateTrace(rightTrace);

  return {
    left: summarizeSide(leftTrace, leftEvaluation),
    right: summarizeSide(rightTrace, rightEvaluation),
    diff: buildDiff(leftTrace, leftEvaluation, rightTrace, rightEvaluation),
  };
}

export function renderComparisonMarkdownReport(comparison) {
  const { left, right, diff } = comparison;

  return `# Trace Comparison Report\n\n## Runs\n- Left: ${left.metadata.runId} (${left.metadata.promptVariant})\n- Right: ${right.metadata.runId} (${right.metadata.promptVariant})\n\n## Scorecard\n- Left Score: ${left.evaluation.score} (${left.evaluation.severity})\n- Right Score: ${right.evaluation.score} (${right.evaluation.severity})\n- Score Delta: ${formatSignedNumber(diff.scoreDelta)}\n- Failure Delta: ${formatSignedNumber(diff.failureDelta)}\n- Retry Delta: ${formatSignedNumber(diff.retryDelta)}\n- Approval Delta: ${formatSignedNumber(diff.approvalDelta)}\n- Risky Command Delta: ${formatSignedNumber(diff.riskyCommandDelta)}\n- Prompt Risk Delta: ${formatSignedNumber(diff.riskyPromptDelta)}\n\n## Better Run\n- ${diff.betterRunLabel}\n\n## New Rule Hits In Right Run\n${renderBulletList(diff.newRuleHits, 'No new rule hits in the right run.')}\n\n## New Recommendations After Comparison\n${renderBulletList(diff.comparisonRecommendations, 'No extra comparison recommendations.')}\n`;
}

export function buildComparisonJsonReport(comparison) {
  return comparison;
}

function summarizeSide(parsed, evaluation) {
  return {
    metadata: parsed.metadata,
    summary: parsed.summary,
    evaluation,
  };
}

function buildDiff(leftTrace, leftEvaluation, rightTrace, rightEvaluation) {
  const leftRuleIds = new Set(leftEvaluation.ruleHits.map((item) => item.id));
  const rightRuleIds = new Set(rightEvaluation.ruleHits.map((item) => item.id));
  const newRuleHits = [...rightRuleIds].filter((id) => !leftRuleIds.has(id));

  const comparisonRecommendations = [];

  if (rightEvaluation.score < leftEvaluation.score) {
    comparisonRecommendations.push('The right run regressed overall, so review the prompt or tool changes before promoting it.');
  }

  if (rightTrace.summary.riskyPromptCount > leftTrace.summary.riskyPromptCount) {
    comparisonRecommendations.push('Prompt-risk findings increased in the right run, which suggests the new variant needs tighter instruction boundaries.');
  }

  if (rightTrace.summary.failureCount > leftTrace.summary.failureCount) {
    comparisonRecommendations.push('Failures increased in the right run, so diff the failing steps before trusting the newer variant.');
  }

  return {
    scoreDelta: rightEvaluation.score - leftEvaluation.score,
    failureDelta: rightTrace.summary.failureCount - leftTrace.summary.failureCount,
    retryDelta: rightTrace.summary.retryCount - leftTrace.summary.retryCount,
    approvalDelta: rightTrace.summary.approvalCount - leftTrace.summary.approvalCount,
    riskyCommandDelta: rightTrace.summary.riskyCommandCount - leftTrace.summary.riskyCommandCount,
    riskyPromptDelta: rightTrace.summary.riskyPromptCount - leftTrace.summary.riskyPromptCount,
    newRuleHits,
    betterRunLabel: pickBetterRun(leftTrace, leftEvaluation, rightTrace, rightEvaluation),
    comparisonRecommendations,
  };
}

function pickBetterRun(leftTrace, leftEvaluation, rightTrace, rightEvaluation) {
  if (leftEvaluation.score === rightEvaluation.score) {
    if (leftTrace.summary.failureCount === rightTrace.summary.failureCount) {
      return 'Tie';
    }

    return leftTrace.summary.failureCount < rightTrace.summary.failureCount ? 'Left run' : 'Right run';
  }

  return leftEvaluation.score > rightEvaluation.score ? 'Left run' : 'Right run';
}

function renderBulletList(items, fallback) {
  if (!items.length) {
    return `- ${fallback}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function formatSignedNumber(value) {
  return value > 0 ? `+${value}` : String(value);
}
