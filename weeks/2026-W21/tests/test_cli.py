from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CliTests(unittest.TestCase):
    def test_analyze_writes_report_and_returns_failure_for_violations(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "report.json"
            result = subprocess.run(
                [
                    sys.executable,
                    str(ROOT / "src" / "cli.py"),
                    "analyze",
                    str(ROOT / "demos" / "problematic-system.json"),
                    "--output",
                    str(output),
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 1)
            report = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(report["violation_count"], 5)
            self.assertEqual(report["remediation_plan"][0]["priority"], "high")

    def test_analyze_returns_success_for_clean_system(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(ROOT / "src" / "cli.py"),
                "analyze",
                str(ROOT / "demos" / "clean-system.json"),
            ],
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0)
        self.assertIn('"violation_count": 0', result.stdout)

    def test_analyze_writes_markdown_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "report.md"
            result = subprocess.run(
                [
                    sys.executable,
                    str(ROOT / "src" / "cli.py"),
                    "analyze",
                    str(ROOT / "demos" / "problematic-system.json"),
                    "--format",
                    "markdown",
                    "--output",
                    str(output),
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 1)
            markdown = output.read_text(encoding="utf-8")
            self.assertIn("# Architecture Fitness Report", markdown)
            self.assertIn("### forbidden_dependency: web -> orders", markdown)
            self.assertIn("## Suggested Remediation", markdown)

    def test_analyze_compares_against_baseline_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            baseline = Path(tmp) / "baseline.json"
            output = Path(tmp) / "report.json"
            baseline.write_text(
                json.dumps(
                    {
                        "violations": [
                            {
                                "kind": "cycle",
                                "service": "api",
                                "dependency": "orders",
                                "message": "dependency cycle: api -> orders -> api",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            result = subprocess.run(
                [
                    sys.executable,
                    str(ROOT / "src" / "cli.py"),
                    "analyze",
                    str(ROOT / "demos" / "problematic-system.json"),
                    "--baseline",
                    str(baseline),
                    "--output",
                    str(output),
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 1)
            report = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(report["baseline"]["status"], "regressed")
            self.assertEqual(report["baseline"]["introduced_count"], 4)


if __name__ == "__main__":
    unittest.main()
