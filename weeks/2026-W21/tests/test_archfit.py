from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from archfit import ConfigError, analyze, load_architecture


class ArchitectureFitnessTests(unittest.TestCase):
    def test_clean_system_has_no_violations(self) -> None:
        report = analyze(load_architecture(ROOT / "demos" / "clean-system.json"))

        self.assertEqual(report["service_count"], 4)
        self.assertEqual(report["violation_count"], 0)

    def test_problematic_system_reports_forbidden_missing_and_cycle(self) -> None:
        report = analyze(load_architecture(ROOT / "demos" / "problematic-system.json"))
        kinds = {item["kind"] for item in report["violations"]}

        self.assertEqual(report["violation_count"], 3)
        self.assertEqual(kinds, {"cycle", "forbidden_dependency", "missing_dependency"})

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


if __name__ == "__main__":
    unittest.main()
