# Local AI Trace Evaluation

This exercise builds a tiny evaluator for AI workflow traces. It is intentionally dependency-free so it can run inside scheduled automation without a package install step.

## Trace Format

Each JSONL row contains:

- `id`: stable trace identifier.
- `prompt`: user or system request being evaluated.
- `response`: assistant output.
- `expected`: short answer terms that should appear in the response.
- `tools`: optional list of tool names used during the run.

## Run It

From the week folder:

```powershell
$env:PYTHONPATH = "src"
python -m prompt_eval.cli demos/sample_traces.jsonl --out-dir demos/out
python -m unittest discover -s tests
```

The CLI writes `report.json` for automation and `report.md` for humans.

## Scoring Model

- Expected-answer score: fraction of expected tokens covered by the response.
- Grounding score: fraction of response tokens found in the prompt.
- Risk findings: simple regex rules for unverifiable certainty, leaked-secret markers, unsafe automation advice, and weak grounding language.

The point is not to create a perfect judge. The point is to make review signals deterministic, inspectable, and easy to improve.
