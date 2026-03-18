export type Tokens = {
  color: {
    primary: string;
    primaryText: string;
    surface: string;
    surfaceText: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
};

export const baseTokens: Tokens = {
  color: {
    primary: "#3b82f6",
    primaryText: "#ffffff",
    surface: "#0f172a",
    surfaceText: "#e2e8f0",
    border: "#1f2937"
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px"
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px"
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui",
    fontSize: "16px",
    fontWeight: "500"
  }
};

export function createTheme(overrides: Partial<Tokens> = {}): Tokens {
  return {
    color: { ...baseTokens.color, ...overrides.color },
    spacing: { ...baseTokens.spacing, ...overrides.spacing },
    radius: { ...baseTokens.radius, ...overrides.radius },
    typography: { ...baseTokens.typography, ...overrides.typography }
  };
}

export function toCssVars(tokens: Tokens, selector = ":root"): string {
  const lines: string[] = [];
  const push = (name: string, value: string) => lines.push(`  --${name}: ${value};`);

  Object.entries(tokens.color).forEach(([key, value]) => push(`color-${key}`, value));
  Object.entries(tokens.spacing).forEach(([key, value]) => push(`space-${key}`, value));
  Object.entries(tokens.radius).forEach(([key, value]) => push(`radius-${key}`, value));
  Object.entries(tokens.typography).forEach(([key, value]) => push(`type-${key}`, value));

  return `${selector} {\n${lines.join("\n")}\n}`;
}
