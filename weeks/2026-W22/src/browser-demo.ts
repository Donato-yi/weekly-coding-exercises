import { buildInspectorViewModel, type InspectorViewModel } from "./inspector.js";

const fixtureSelect = document.querySelector<HTMLSelectElement>("#fixture");
const root = document.querySelector<HTMLElement>("#inspector");

if (!fixtureSelect || !root) {
  throw new Error("Inspector demo markup is missing required nodes.");
}

fixtureSelect.addEventListener("change", () => {
  void loadFixture(fixtureSelect.value);
});

void loadFixture(fixtureSelect.value);

async function loadFixture(path: string): Promise<void> {
  root.innerHTML = "<p class=\"muted\">Loading token set...</p>";
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error("Unable to load fixture: " + path);
  }

  const model = buildInspectorViewModel((await response.json()) as unknown);
  render(model);
}

function render(model: InspectorViewModel): void {
  root.innerHTML = [
    renderSummary(model),
    renderSwatches(model),
    renderTypography(model),
    renderRamps(model),
    renderContrast(model),
    renderIssues(model)
  ].join("");
}

function renderSummary(model: InspectorViewModel): string {
  return `
    <section class="panel summary">
      <div>
        <p class="eyebrow">Token set</p>
        <h2>${escapeHtml(model.name)}</h2>
      </div>
      <dl>
        <div><dt>Pass</dt><dd>${model.summary.pass}</dd></div>
        <div><dt>Warnings</dt><dd>${model.summary.warning}</dd></div>
        <div><dt>Failures</dt><dd>${model.summary.fail}</dd></div>
      </dl>
    </section>
  `;
}

function renderSwatches(model: InspectorViewModel): string {
  return `
    <section class="panel">
      <h3>Color Swatches</h3>
      <div class="swatch-grid">
        ${model.colorSwatches
          .map(
            (swatch) => `
              <article class="swatch-card">
                <div class="swatch" style="--swatch: ${escapeAttribute(swatch.value)}"></div>
                <strong>${escapeHtml(swatch.name)}</strong>
                <span>${escapeHtml(swatch.value)}</span>
                <small>${swatch.issueCount ? swatch.issueCount + " issue(s)" : "No direct issues"}</small>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderTypography(model: InspectorViewModel): string {
  return `
    <section class="panel">
      <h3>Typography</h3>
      <div class="stack">
        ${model.typographySamples
          .map(
            (item) => `
              <article class="sample">
                <strong>${escapeHtml(item.name)}</strong>
                <p style="font: ${escapeAttribute(item.value)}">${escapeHtml(item.sample)}</p>
                <small>${escapeHtml(item.value)}</small>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderRamps(model: InspectorViewModel): string {
  return `
    <section class="panel ramps">
      <h3>Spacing & Radius</h3>
      <div>
        <h4>Spacing</h4>
        ${model.spacingRamp.map((item) => `<div class="ramp-row"><span>${escapeHtml(item.name)}</span><i style="width: ${escapeAttribute(item.value)}"></i><code>${escapeHtml(item.value)}</code></div>`).join("")}
      </div>
      <div>
        <h4>Radius</h4>
        ${model.radiusRamp.map((item) => `<div class="radius-row"><span>${escapeHtml(item.name)}</span><i style="border-radius: ${escapeAttribute(item.value)}"></i><code>${escapeHtml(item.value)}</code></div>`).join("")}
      </div>
    </section>
  `;
}

function renderContrast(model: InspectorViewModel): string {
  return `
    <section class="panel">
      <h3>Contrast Pairs</h3>
      <div class="contrast-grid">
        ${model.contrastPreviews
          .map(
            (pair) => `
              <article class="contrast-card ${pair.status}">
                <div class="contrast-preview" style="color: ${escapeAttribute(pair.foregroundValue ?? "#111827")}; background: ${escapeAttribute(pair.backgroundValue ?? "#ffffff")}">Aa</div>
                <strong>${escapeHtml(pair.name)}</strong>
                <span>${escapeHtml(pair.message)}</span>
                <small>${escapeHtml(pair.foreground)} on ${escapeHtml(pair.background)}</small>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderIssues(model: InspectorViewModel): string {
  return `
    <section class="panel">
      <h3>Audit Issues</h3>
      <div class="stack">
        ${model.issues.length === 0 ? "<p class=\"muted\">No issues found.</p>" : ""}
        ${model.issues
          .map(
            (issue) => `
              <article class="issue ${issue.severity}">
                <strong>${escapeHtml(issue.code)}</strong>
                <span>${escapeHtml(issue.path)}</span>
                <p>${escapeHtml(issue.message)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/\n/g, " ");
}
