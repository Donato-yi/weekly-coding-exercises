import os
import sys
from pathlib import Path
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from src.architecture_linter.models import load_spec
from src.architecture_linter.report import render_markdown
from src.architecture_linter.rules import evaluate


class ArchitectureLinterTests(unittest.TestCase):
    def _write_spec(self, payload: str) -> str:
        handle = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
        handle.write(payload)
        handle.close()
        self.addCleanup(lambda: Path(handle.name).unlink(missing_ok=True))
        return handle.name

    def test_valid_spec_has_no_findings(self) -> None:
        path = self._write_spec(
            '{"services": ['
            '{"name": "edge-gateway", "layer": "edge", "depends_on": ["api"]},'
            '{"name": "api", "layer": "application", "depends_on": ["billing-domain"]},'
            '{"name": "billing-domain", "layer": "domain", "depends_on": ["billing-store"]},'
            '{"name": "billing-store", "layer": "data", "depends_on": []}'
            ']}'
        )
        spec = load_spec(path)
        findings = evaluate(spec)
        self.assertEqual(findings, [])

    def test_outward_dependency_is_flagged(self) -> None:
        path = self._write_spec(
            '{"services": ['
            '{"name": "billing-store", "layer": "data", "depends_on": ["api"]},'
            '{"name": "api", "layer": "application", "depends_on": []}'
            ']}'
        )
        findings = evaluate(load_spec(path))
        self.assertTrue(any(f.code == "layer_violation" for f in findings))

    def test_cycle_is_detected(self) -> None:
        path = self._write_spec(
            '{"services": ['
            '{"name": "api", "layer": "application", "depends_on": ["domain"]},'
            '{"name": "domain", "layer": "domain", "depends_on": ["api"]}'
            ']}'
        )
        findings = evaluate(load_spec(path))
        self.assertTrue(any(f.code == "dependency_cycle" for f in findings))

    def test_markdown_report_contains_summary(self) -> None:
        path = self._write_spec(
            '{"services": ['
            '{"name": "api", "layer": "application", "depends_on": ["domain"]},'
            '{"name": "domain", "layer": "domain", "depends_on": ["api"]}'
            ']}'
        )
        spec = load_spec(path)
        report = render_markdown(spec, evaluate(spec))
        self.assertIn("# Architecture Review Report", report)
        self.assertIn("## Recommendation", report)


if __name__ == "__main__":
    unittest.main()
