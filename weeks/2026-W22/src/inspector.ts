import {
  auditTokenSet,
  contrastRatio,
  type AuditIssue,
  type ContrastPair,
  type NormalizedToken,
  type NormalizedTokenSet,
  parseTokenSet,
  type Severity
} from "./tokens.js";

export interface ColorSwatch {
  name: string;
  value: string;
  description?: string;
  aliases: string[];
  issueCount: number;
}

export interface TypographySample {
  name: string;
  value: string;
  sample: string;
}

export interface RampItem {
  name: string;
  value: string;
}

export interface ContrastPreview {
  name: string;
  foreground: string;
  background: string;
  foregroundValue?: string;
  backgroundValue?: string;
  ratio: number | null;
  status: Severity;
  message: string;
}

export interface InspectorViewModel {
  name: string;
  summary: Record<Severity, number>;
  colorSwatches: ColorSwatch[];
  typographySamples: TypographySample[];
  spacingRamp: RampItem[];
  radiusRamp: RampItem[];
  contrastPreviews: ContrastPreview[];
  issues: AuditIssue[];
}

export function buildInspectorViewModel(input: unknown): InspectorViewModel {
  const tokenSet = parseTokenSet(input);
  const report = auditTokenSet(input);
  const issuesByPath = groupIssuesByPath(report.issues);
  const tokensByName = new Map(tokenSet.tokens.map((token) => [token.name, token]));

  return {
    name: tokenSet.name,
    summary: report.summary,
    colorSwatches: tokenSet.tokens
      .filter((token) => token.category === "color")
      .map((token) => ({
        name: token.name,
        value: token.value,
        description: token.description,
        aliases: token.aliases ?? [],
        issueCount: issuesByPath.get(token.name)?.length ?? 0
      })),
    typographySamples: tokenSet.tokens
      .filter((token) => token.category === "typography")
      .map((token) => ({
        name: token.name,
        value: token.value,
        sample: "The quick brown fox reviews product UI."
      })),
    spacingRamp: tokenSet.tokens.filter((token) => token.category === "spacing").map(toRampItem),
    radiusRamp: tokenSet.tokens.filter((token) => token.category === "radius").map(toRampItem),
    contrastPreviews: collectContrastPairs(tokenSet).map((pair) => toContrastPreview(pair, tokensByName)),
    issues: report.issues
  };
}

function toRampItem(token: NormalizedToken): RampItem {
  return {
    name: token.name,
    value: token.value
  };
}

function toContrastPreview(pair: ContrastPair, tokensByName: Map<string, NormalizedToken>): ContrastPreview {
  const foreground = tokensByName.get(pair.foreground);
  const background = tokensByName.get(pair.background);

  if (!foreground || !background) {
    return {
      name: pair.name,
      foreground: pair.foreground,
      background: pair.background,
      ratio: null,
      status: "fail",
      message: "Missing foreground or background token."
    };
  }

  if (foreground.category !== "color" || background.category !== "color") {
    return {
      name: pair.name,
      foreground: pair.foreground,
      background: pair.background,
      foregroundValue: foreground.value,
      backgroundValue: background.value,
      ratio: null,
      status: "fail",
      message: "Contrast previews require color tokens."
    };
  }

  const ratio = contrastRatio(foreground.value, background.value);
  if (ratio === null) {
    return {
      name: pair.name,
      foreground: pair.foreground,
      background: pair.background,
      foregroundValue: foreground.value,
      backgroundValue: background.value,
      ratio,
      status: "fail",
      message: "Contrast preview requires valid hex colors."
    };
  }

  const minimumRatio = pair.minimumRatio ?? 4.5;
  const status: Severity = ratio < minimumRatio ? "fail" : ratio < 7 ? "warning" : "pass";
  return {
    name: pair.name,
    foreground: pair.foreground,
    background: pair.background,
    foregroundValue: foreground.value,
    backgroundValue: background.value,
    ratio,
    status,
    message: "Contrast ratio " + ratio.toFixed(2) + ":1"
  };
}

function collectContrastPairs(tokenSet: NormalizedTokenSet): ContrastPair[] {
  const pairs = new Map<string, ContrastPair>();
  for (const pair of tokenSet.contrastPairs) {
    pairs.set(pair.name, pair);
  }

  const colorNames = new Set(tokenSet.tokens.filter((token) => token.category === "color").map((token) => token.name));
  for (const token of tokenSet.tokens) {
    if (token.category !== "color" || token.path.at(-1) !== "foreground") {
      continue;
    }

    const basePath = token.path.slice(0, -1);
    const background = [...basePath, "background"].join(".");
    const name = basePath.join(".");
    if (colorNames.has(background) && !pairs.has(name)) {
      pairs.set(name, {
        name,
        foreground: token.name,
        background
      });
    }
  }

  return [...pairs.values()];
}

function groupIssuesByPath(issues: AuditIssue[]): Map<string, AuditIssue[]> {
  const grouped = new Map<string, AuditIssue[]>();
  for (const issue of issues) {
    const current = grouped.get(issue.path) ?? [];
    current.push(issue);
    grouped.set(issue.path, current);
  }
  return grouped;
}
