import { describe, expect, it } from "vitest";
import { buildInspectorViewModel } from "../src/inspector.js";

describe("buildInspectorViewModel", () => {
  it("groups tokens into preview sections for the browser inspector", () => {
    const model = buildInspectorViewModel({
      name: "preview-system",
      contrastPairs: [
        {
          name: "body",
          foreground: "color.text.primary",
          background: "color.surface.canvas"
        }
      ],
      tokens: [
        { name: "color.text.primary", category: "color", value: "#111827" },
        { name: "color.surface.canvas", category: "color", value: "#ffffff" },
        { name: "typography.body-md", category: "typography", value: "16px/1.5 Inter" },
        { name: "spacing.scale-2", category: "spacing", value: "0.5rem" },
        { name: "radius.card-sm", category: "radius", value: "6px" }
      ]
    });

    expect(model.name).toBe("preview-system");
    expect(model.colorSwatches).toHaveLength(2);
    expect(model.typographySamples[0]).toMatchObject({ name: "typography.body-md" });
    expect(model.spacingRamp[0]).toEqual({ name: "spacing.scale-2", value: "0.5rem" });
    expect(model.radiusRamp[0]).toEqual({ name: "radius.card-sm", value: "6px" });
    expect(model.contrastPreviews[0]).toMatchObject({ name: "body", status: "pass" });
  });

  it("surfaces failing contrast previews for problematic token sets", () => {
    const model = buildInspectorViewModel({
      name: "problematic-preview",
      contrastPairs: [
        {
          name: "muted-copy",
          foreground: "color.text.muted",
          background: "color.surface.card"
        }
      ],
      tokens: [
        { name: "color.text.muted", category: "color", value: "#9ca3af" },
        { name: "color.surface.card", category: "color", value: "#f9fafb" }
      ]
    });

    expect(model.summary.fail).toBe(1);
    expect(model.contrastPreviews[0]).toMatchObject({ name: "muted-copy", status: "fail" });
  });
});
