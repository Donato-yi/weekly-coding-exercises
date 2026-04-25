const HEX_COLOR = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;
const TOKEN_ALIAS = /^\{([a-z0-9_.-]+)\}$/i;

export function flattenTokens(input, prefix = [], out = {}) {
  for (const [key, value] of Object.entries(input)) {
    if (key === 'checks') continue;
    const path = [...prefix, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenTokens(value, path, out);
    } else {
      out[path.join('.')] = value;
    }
  }
  return out;
}

export function toCssVarName(path) {
  return `--${path.replace(/\./g, '-')}`;
}

export function isAlias(value) {
  return typeof value === 'string' && TOKEN_ALIAS.test(value.trim());
}

export function getAliasTarget(value) {
  const match = typeof value === 'string' ? value.trim().match(TOKEN_ALIAS) : null;
  return match ? match[1] : null;
}

function looksLikeColorPath(path) {
  return /(^|\.)colors(\.|$)|(^|\.)color(\.|$)/i.test(path);
}

export function resolveToken(flatTokens, path, stack = []) {
  if (!(path in flatTokens)) {
    throw new Error(`Unknown token path: ${path}`);
  }

  const value = flatTokens[path];
  const aliasTarget = getAliasTarget(value);
  if (!aliasTarget) {
    return value;
  }

  if (stack.includes(path)) {
    throw new Error(`Alias cycle detected: ${[...stack, path].join(' -> ')}`);
  }

  return resolveToken(flatTokens, aliasTarget, [...stack, path]);
}

export function inspectTokens(tokens) {
  const flat = flattenTokens(tokens);
  const warnings = [];

  for (const [path, value] of Object.entries(flat)) {
    const aliasTarget = getAliasTarget(value);
    if (aliasTarget) {
      if (!(aliasTarget in flat)) {
        warnings.push({
          type: 'dangling-alias',
          path,
          message: `${path} points to missing token ${aliasTarget}`,
        });
        continue;
      }

      try {
        resolveToken(flat, path);
      } catch (error) {
        warnings.push({
          type: 'alias-cycle',
          path,
          message: error.message,
        });
      }
      continue;
    }

    if (looksLikeColorPath(path) && typeof value === 'string' && !HEX_COLOR.test(value)) {
      warnings.push({
        type: 'non-hex-color',
        path,
        message: `${path} uses non-hex color value ${value}`,
      });
    }
  }

  return warnings;
}

export function buildCssVariables(tokens, selector = ':root') {
  const flat = flattenTokens(tokens);
  const lines = Object.entries(flat)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, value]) => {
      const aliasTarget = getAliasTarget(value);
      const cssValue = aliasTarget ? `var(${toCssVarName(aliasTarget)})` : value;
      return `  ${toCssVarName(path)}: ${cssValue};`;
    });
  return `${selector} {\n${lines.join('\n')}\n}`;
}

export function normalizeHex(hex) {
  if (!HEX_COLOR.test(hex)) {
    throw new Error(`Expected hex color, received: ${hex}`);
  }
  const clean = hex.slice(1);
  if (clean.length === 3) {
    return `#${clean.split('').map((part) => part + part).join('')}`.toLowerCase();
  }
  return `#${clean.toLowerCase()}`;
}

export function hexToRgb(hex) {
  const value = normalizeHex(hex).slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function toLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return Number((((lighter + 0.05) / (darker + 0.05))).toFixed(2));
}

export function auditTheme(tokens) {
  const flat = flattenTokens(tokens);
  const checks = Array.isArray(tokens.checks) ? tokens.checks : [];
  return checks.map((check) => {
    const foreground = resolveToken(flat, check.foreground);
    const background = resolveToken(flat, check.background);
    const ratio = contrastRatio(foreground, background);
    const minRatio = Number(check.minRatio ?? 4.5);
    const status = ratio >= minRatio ? 'pass' : ratio >= minRatio - 1 ? 'warn' : 'fail';
    return {
      name: check.name,
      foreground,
      background,
      ratio,
      minRatio,
      status,
      message: ratio >= minRatio
        ? `Passes minimum ratio ${minRatio}`
        : `Below minimum ratio ${minRatio} by ${(minRatio - ratio).toFixed(2)}`,
    };
  });
}

export function buildSummary(tokens) {
  const checks = auditTheme(tokens);
  const warnings = inspectTokens(tokens);
  const counts = checks.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { pass: 0, warn: 0, fail: 0 });

  const reviewChecklist = [
    ...checks
      .filter((item) => item.status !== 'pass')
      .map((item) => ({
        type: 'contrast',
        name: item.name,
        status: item.status,
        action: item.status === 'fail'
          ? `Adjust ${item.name} before release, it is ${(item.minRatio - item.ratio).toFixed(2)} below the target ratio.`
          : `Review ${item.name}, it is close to the minimum ratio ${item.minRatio}.`,
      })),
    ...warnings.map((warning) => ({
      type: warning.type,
      name: warning.path,
      status: 'warn',
      action: warning.type === 'dangling-alias'
        ? `Fix or remove the alias at ${warning.path} so the semantic token resolves cleanly.`
        : `Review ${warning.path} because ${warning.message}`,
    })),
  ];

  return {
    tokenCount: Object.keys(flattenTokens(tokens)).length,
    counts,
    warningCount: warnings.length,
    warnings,
    checks,
    reviewChecklist,
  };
}
