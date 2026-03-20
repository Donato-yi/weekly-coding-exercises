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

export type ThemePreset = "light" | "dark" | "sunset";

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

export const themePresets: Record<ThemePreset, Partial<Tokens>> = {
  light: {
    color: {
      primary: "#2563eb",
      primaryText: "#ffffff",
      surface: "#ffffff",
      surfaceText: "#0f172a",
      border: "#e2e8f0"
    }
  },
  dark: {
    color: {
      primary: "#22c55e",
      primaryText: "#0b1120",
      surface: "#0b1120",
      surfaceText: "#e5e7eb",
      border: "#1f2937"
    }
  },
  sunset: {
    color: {
      primary: "#f97316",
      primaryText: "#0f172a",
      surface: "#fff7ed",
      surfaceText: "#7c2d12",
      border: "#fdba74"
    },
    typography: {
      fontFamily: "Poppins, ui-sans-serif, system-ui",
      fontSize: "16px",
      fontWeight: "600"
    }
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

export function createPresetTheme(preset: ThemePreset, overrides: Partial<Tokens> = {}): Tokens {
  const presetTokens = themePresets[preset] ?? {};
  return createTheme({
    color: { ...presetTokens.color, ...overrides.color },
    spacing: { ...presetTokens.spacing, ...overrides.spacing },
    radius: { ...presetTokens.radius, ...overrides.radius },
    typography: { ...presetTokens.typography, ...overrides.typography }
  });
}

export function toCssVarMap(tokens: Tokens): Record<string, string> {
  const vars: Record<string, string> = {};
  const set = (name: string, value: string) => {
    vars[`--${name}`] = value;
  };

  Object.entries(tokens.color).forEach(([key, value]) => set(`color-${key}`, value));
  Object.entries(tokens.spacing).forEach(([key, value]) => set(`space-${key}`, value));
  Object.entries(tokens.radius).forEach(([key, value]) => set(`radius-${key}`, value));
  Object.entries(tokens.typography).forEach(([key, value]) => set(`type-${key}`, value));

  return vars;
}

export function toCssVars(tokens: Tokens, selector = ":root"): string {
  const varMap = toCssVarMap(tokens);
  const lines = Object.entries(varMap).map(([name, value]) => `  ${name}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}
