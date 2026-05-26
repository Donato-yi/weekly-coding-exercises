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

export interface TokenSet {
  name: string;
  tokens: RawToken[];
}

export interface NormalizedToken extends RawToken {
  path: string[];
}

export interface NormalizedTokenSet {
  name: string;
  tokens: NormalizedToken[];
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
  return { name, tokens };
}

export function auditTokenSet(input: unknown): AuditReport {
  const tokenSet = parseTokenSet(input);
  const issues: AuditIssue[] = [];
  const aliases = new Map<string, string>();
  const names = new Set<string>();

  for (const token of tokenSet.tokens) {
    const path = token.path.join(".");

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

  return {
    name: tokenSet.name,
    tokenCount: tokenSet.tokens.length,
    issues,
    summary: summarizeIssues(issues)
  };
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
