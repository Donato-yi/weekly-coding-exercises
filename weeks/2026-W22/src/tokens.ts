export const TOKEN_CATEGORIES = ["color", "typography", "spacing", "radius", "shadow"] as const;

export type TokenCategory = (typeof TOKEN_CATEGORIES)[number];

export type Severity = "pass" | "warning" | "fail";

export interface RawToken {
  name: string;
  category: TokenCategory;
  value: string;
  description?: string;
  aliases?: string[];
}

export interface ContrastPair {
  name: string;
  foreground: string;
  background: string;
  minimumRatio?: number;
}

export interface TokenSet {
  name: string;
  tokens: RawToken[];
  contrastPairs?: ContrastPair[];
}

export interface NormalizedToken extends RawToken {
  path: string[];
}

export interface NormalizedTokenSet {
  name: string;
  tokens: NormalizedToken[];
  contrastPairs: ContrastPair[];
}

export interface AuditIssue {
  severity: Exclude<Severity, "pass">;
  code: string;
  path: string;
  message: string;
}

export interface AuditReport {
  name: string;
  tokenCount: number;
  issues: AuditIssue[];
  summary: Record<Severity, number>;
}

const categorySet = new Set<string>(TOKEN_CATEGORIES);
const nameSegmentPattern = /^[a-z][a-z0-9-]*$/;

export function parseTokenSet(input: unknown): NormalizedTokenSet {
  if (!isRecord(input)) {
    throw new Error("Token set must be an object.");
  }

  const name = optionalString(input.name, "token-set");
  const rawTokens = input.tokens;
  if (!Array.isArray(rawTokens)) {
    throw new Error("Token set must include a tokens array.");
  }

  const tokens = rawTokens.map((token, index) => normalizeToken(token, index));
  const contrastPairs = normalizeContrastPairs(input.contrastPairs);
  return { name, tokens, contrastPairs };
}

export function auditTokenSet(input: unknown): AuditReport {
  const tokenSet = parseTokenSet(input);
  const issues: AuditIssue[] = [];
  const aliases = new Map<string, string>();
  const names = new Set<string>();
  const tokensByName = new Map<string, NormalizedToken>();

  for (const token of tokenSet.tokens) {
    const path = token.path.join(".");
    tokensByName.set(token.name, token);

    if (names.has(token.name)) {
      issues.push({
        severity: "fail",
        code: "duplicate-token-name",
        path,
        message: "Token names must be unique."
      });
    }
    names.add(token.name);

    if (token.path[0] !== token.category) {
      issues.push({
        severity: "fail",
        code: "category-prefix-mismatch",
        path,
        message: "Token name must start with its category prefix: " + token.category + "."
      });
    }

    for (const segment of token.path) {
      if (!nameSegmentPattern.test(segment)) {
        issues.push({
          severity: "fail",
          code: "token-name-format",
          path,
          message: "Token names must use lowercase dot-separated kebab-case segments."
        });
        break;
      }
    }

    if (token.category === "color" && !isHexColor(token.value)) {
      issues.push({
        severity: "fail",
        code: "invalid-color-value",
        path,
        message: "Color tokens must use 3, 6, or 8 digit hex values."
      });
    }

    if (token.category !== "color" && !token.value.trim()) {
      issues.push({
        severity: "fail",
        code: "empty-token-value",
        path,
        message: "Non-color tokens must include a non-empty value."
      });
    }

    if (token.path.some((segment) => ["misc", "other", "stuff"].some((vague) => segment === vague || segment.startsWith(vague + "-")))) {
      issues.push({
        severity: "warning",
        code: "ambiguous-token-name",
        path,
        message: "Avoid vague token segments; name the UI role or scale purpose."
      });
    }

    for (const alias of token.aliases ?? []) {
      const owner = aliases.get(alias);
      if (owner && owner !== token.name) {
        issues.push({
          severity: "fail",
          code: "duplicate-alias",
          path,
          message: "Alias " + alias + " is already assigned to " + owner + "."
        });
      }
      aliases.set(alias, token.name);
    }
  }

  for (const pair of collectContrastPairs(tokenSet)) {
    const foreground = tokensByName.get(pair.foreground);
    const background = tokensByName.get(pair.background);
    const pairPath = "contrast." + pair.name;

    if (!foreground || !background) {
      issues.push({
        severity: "fail",
        code: "missing-contrast-token",
        path: pairPath,
        message: "Contrast pair must reference existing foreground and background tokens."
      });
      continue;
    }

    if (foreground.category !== "color" || background.category !== "color") {
      issues.push({
        severity: "fail",
        code: "contrast-token-category",
        path: pairPath,
        message: "Contrast pairs can only reference color tokens."
      });
      continue;
    }

    const ratio = contrastRatio(foreground.value, background.value);
    if (ratio === null) {
      continue;
    }

    const minimumRatio = pair.minimumRatio ?? 4.5;
    if (ratio < minimumRatio) {
      issues.push({
        severity: "fail",
        code: "contrast-ratio-fail",
        path: pairPath,
        message:
          "Contrast ratio " +
          ratio.toFixed(2) +
          ":1 is below the required " +
          minimumRatio.toFixed(2) +
          ":1."
      });
    } else if (ratio < 7) {
      issues.push({
        severity: "warning",
        code: "contrast-ratio-aa-only",
        path: pairPath,
        message: "Contrast ratio " + ratio.toFixed(2) + ":1 passes AA text guidance but not AAA."
      });
    }
  }

  return {
    name: tokenSet.name,
    tokenCount: tokenSet.tokens.length,
    issues,
    summary: summarizeIssues(issues)
  };
}

export function contrastRatio(foreground: string, background: string): number | null {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);
  if (!fg || !bg) {
    return null;
  }

  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

export function summarizeIssues(issues: AuditIssue[]): Record<Severity, number> {
  return {
    pass: issues.length === 0 ? 1 : 0,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    fail: issues.filter((issue) => issue.severity === "fail").length
  };
}

function normalizeToken(input: unknown, index: number): NormalizedToken {
  if (!isRecord(input)) {
    throw new Error("Token at index " + index + " must be an object.");
  }

  const name = requiredString(input.name, "tokens[" + index + "].name");
  const category = requiredString(input.category, "tokens[" + index + "].category");
  if (!categorySet.has(category)) {
    throw new Error("tokens[" + index + "].category must be one of: " + TOKEN_CATEGORIES.join(", ") + ".");
  }

  const value = requiredString(input.value, "tokens[" + index + "].value");
  const aliases = input.aliases === undefined ? undefined : normalizeAliases(input.aliases, index);

  return {
    name,
    category: category as TokenCategory,
    value,
    description: optionalString(input.description),
    aliases,
    path: name.split(".")
  };
}

function normalizeAliases(input: unknown, index: number): string[] {
  if (!Array.isArray(input) || !input.every((alias) => typeof alias === "string")) {
    throw new Error("tokens[" + index + "].aliases must be an array of strings when provided.");
  }
  return input;
}

function normalizeContrastPairs(input: unknown): ContrastPair[] {
  if (input === undefined) {
    return [];
  }
  if (!Array.isArray(input)) {
    throw new Error("contrastPairs must be an array when provided.");
  }

  return input.map((pair, index) => {
    if (!isRecord(pair)) {
      throw new Error("contrastPairs[" + index + "] must be an object.");
    }

    const minimumRatio = pair.minimumRatio;
    if (minimumRatio !== undefined && (typeof minimumRatio !== "number" || minimumRatio <= 0)) {
      throw new Error("contrastPairs[" + index + "].minimumRatio must be a positive number when provided.");
    }

    return {
      name: requiredString(pair.name, "contrastPairs[" + index + "].name"),
      foreground: requiredString(pair.foreground, "contrastPairs[" + index + "].foreground"),
      background: requiredString(pair.background, "contrastPairs[" + index + "].background"),
      minimumRatio
    };
  });
}

function collectContrastPairs(tokenSet: NormalizedTokenSet): ContrastPair[] {
  const pairs = new Map<string, ContrastPair>();

  for (const pair of tokenSet.contrastPairs) {
    pairs.set(pair.name, pair);
  }

  const colorTokens = tokenSet.tokens.filter((token) => token.category === "color");
  for (const token of colorTokens) {
    const lastSegment = token.path.at(-1);
    if (lastSegment !== "foreground") {
      continue;
    }

    const basePath = token.path.slice(0, -1);
    const backgroundName = [...basePath, "background"].join(".");
    if (!colorTokens.some((candidate) => candidate.name === backgroundName)) {
      continue;
    }

    const name = basePath.join(".");
    if (!pairs.has(name)) {
      pairs.set(name, {
        name,
        foreground: token.name,
        background: backgroundName
      });
    }
  }

  return [...pairs.values()];
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(path + " must be a non-empty string.");
  }
  return value.trim();
}

function optionalString(value: unknown, fallback?: string): string | undefined {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }
  return value.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

function parseHexColor(value: string): [number, number, number] | null {
  if (!isHexColor(value)) {
    return null;
  }

  const hex = value.slice(1);
  if (hex.length === 3) {
    return hex.split("").map((digit) => parseInt(digit + digit, 16)) as [number, number, number];
  }

  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
