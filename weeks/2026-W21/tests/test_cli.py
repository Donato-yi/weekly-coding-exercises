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
            self.assertEqual(report["violation_count"], 3)

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


if __name__ == "__main__":
    unittest.main()
