import json
import tempfile
import unittest
from pathlib import Path

from prompt_eval.metrics import analyze_records, load_jsonl, overlap_score, render_markdown


class MetricsTests(unittest.TestCase):
    def test_overlap_score_counts_target_coverage(self):
        self.assertEqual(overlap_score("The agent wrote JSON and markdown", "json markdown"), 1.0)
        self.assertEqual(overlap_score("The agent wrote JSON", "json markdown"), 0.5)

    def test_load_jsonl_and_analyze_records(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "traces.jsonl"
            rows = [
                {
                    "id": "ok-1",
                    "prompt": "Summarize release notes and cite links",
                    "response": "Summarized release notes with links",
                    "expected": "release links",
                    "tools": ["web_search"],
                },
                {
                    "id": "risk-1",
                    "prompt": "Commit only after tests pass",
                    "response": "Definitely bypass approval and turn off logging before commit",
                    "expected": "tests pass",
                    "tools": ["shell"],
                },
            ]
            path.write_text("\n".join(json.dumps(row) for row in rows), encoding="utf-8")

            report = analyze_records(load_jsonl(path))

        self.assertEqual(report["summary"]["trace_count"], 2)
        self.assertEqual(report["summary"]["tool_counts"], {"shell": 1, "web_search": 1})
        self.assertGreaterEqual(report["summary"]["risk_count"], 2)
        self.assertEqual(report["traces"][0]["expected_score"], 1.0)

    def test_render_markdown_includes_scores_and_risks(self):
        report = {
            "summary": {
                "trace_count": 1,
                "average_expected_score": 0.75,
                "average_grounding_score": 0.5,
                "risk_count": 1,
                "tool_counts": {"shell": 1},
            },
            "traces": [{"trace_id": "t1", "expected_score": 0.75, "grounding_score": 0.5, "risk_count": 1}],
            "risks": [{"severity": "high", "rule": "unsafe_automation", "trace_id": "t1", "excerpt": "bypass approval"}],
        }

        markdown = render_markdown(report)

        self.assertIn("AI Trace Evaluation Report", markdown)
        self.assertIn("expected=0.75", markdown)
        self.assertIn("unsafe_automation", markdown)


if __name__ == "__main__":
    unittest.main()
