from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from archfit import ConfigError, analyze, load_architecture, render_markdown_report


class ArchitectureFitnessTests(unittest.TestCase):
    def test_clean_system_has_no_violations(self) -> None:
        report = analyze(load_architecture(ROOT / "demos" / "clean-system.json"))

        self.assertEqual(report["service_count"], 4)
        self.assertEqual(report["violation_count"], 0)

    def test_problematic_system_reports_all_rule_types(self) -> None:
        report = analyze(load_architecture(ROOT / "demos" / "problematic-system.json"))
        kinds = {item["kind"] for item in report["violations"]}

        self.assertEqual(report["violation_count"], 5)
        self.assertEqual(
            kinds,
            {
                "cycle",
                "forbidden_dependency",
                "layer_order",
                "missing_dependency",
                "ownership_boundary",
            },
        )

    def test_layer_order_catches_upward_dependencies(self) -> None:
        architecture = load_architecture(ROOT / "demos" / "problematic-system.json")
        report = analyze(architecture)
        layer_violations = [
            item for item in report["violations"] if item["kind"] == "layer_order"
        ]

        self.assertEqual(len(layer_violations), 1)
        self.assertEqual(layer_violations[0]["service"], "orders")
        self.assertEqual(layer_violations[0]["dependency"], "api")

    def test_package_ownership_boundaries_are_enforced(self) -> None:
        architecture = load_architecture(ROOT / "demos" / "problematic-system.json")
        report = analyze(architecture)
        ownership_violations = [
            item for item in report["violations"] if item["kind"] == "ownership_boundary"
        ]

        self.assertEqual(len(ownership_violations), 1)
        self.assertEqual(ownership_violations[0]["service"], "warehouse")
        self.assertEqual(ownership_violations[0]["dependency"], "orders")

    def test_markdown_report_renders_review_notes(self) -> None:
        report = analyze(load_architecture(ROOT / "demos" / "problematic-system.json"))
        markdown = render_markdown_report(report)

        self.assertIn("# Architecture Fitness Report", markdown)
        self.assertIn("- Violations: 5", markdown)
        self.assertIn("### layer_order: orders -> api", markdown)
        self.assertIn("dependency cycle: api -> orders -> api", markdown)

    def test_markdown_report_handles_clean_system(self) -> None:
        report = analyze(load_architecture(ROOT / "demos" / "clean-system.json"))
        markdown = render_markdown_report(report)

        self.assertIn("- Violations: 0", markdown)
        self.assertIn("- No architecture violations found.", markdown)

    def test_duplicate_services_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text(
                json.dumps(
                    {
                        "services": [
                            {"name": "api", "layer": "edge", "dependencies": []},
                            {"name": "api", "layer": "edge", "dependencies": []},
                        ]
                    }
                ),
                encoding="utf-8",
            )

            with self.assertRaises(ConfigError):
                load_architecture(path)

    def test_duplicate_layer_order_entries_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text(
                json.dumps(
                    {
                        "layer_order": ["edge", "edge"],
                        "services": [
                            {
                                "name": "api",
                                "layer": "edge",
                                "package": "platform",
                                "dependencies": [],
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            with self.assertRaises(ConfigError):
                load_architecture(path)


if __name__ == "__main__":
    unittest.main()
