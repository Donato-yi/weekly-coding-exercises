import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from src.topology import load_services


class ReviewSummaryTests(unittest.TestCase):
    def test_summary_includes_focus_blast_radius(self) -> None:
        graph = load_services(
            {
                "services": [
                    {"name": "identity", "depends_on": [], "owner": "platform", "tier": "core", "has_healthcheck": True},
                    {"name": "catalog", "depends_on": ["identity"], "owner": "commerce", "tier": "core", "has_healthcheck": True},
                    {"name": "edge-gateway", "depends_on": ["catalog"], "owner": "platform", "tier": "edge", "has_healthcheck": True},
                ]
            }
        )
        summary = graph.review_summary(focus="identity")
        self.assertEqual(summary["focus_service"], "identity")
        self.assertEqual(summary["blast_radius"], ["catalog", "edge-gateway"])

    def test_summary_omits_deployment_order_for_cycles(self) -> None:
        graph = load_services(
            {
                "services": [
                    {"name": "api", "depends_on": ["worker"], "owner": "platform", "has_healthcheck": True},
                    {"name": "worker", "depends_on": ["api"], "owner": "platform", "has_healthcheck": True},
                ]
            }
        )
        summary = graph.review_summary()
        self.assertEqual(summary["cycles"], [["api", "worker", "api"]])
        self.assertNotIn("deployment_order", summary)

    def test_policy_scores_rank_riskiest_services_first(self) -> None:
        graph = load_services(
            {
                "services": [
                    {"name": "identity", "depends_on": [], "owner": "platform", "tier": "core", "has_healthcheck": True},
                    {"name": "payments", "depends_on": ["identity"], "owner": "", "tier": "critical", "has_healthcheck": False},
                    {"name": "edge-gateway", "depends_on": ["payments"], "owner": "platform", "tier": "edge", "has_healthcheck": True},
                ]
            }
        )
        scores = graph.policy_scores()
        self.assertEqual(scores[0]["service"], "payments")
        self.assertEqual(scores[0]["level"], "high")
        self.assertIn("payments is missing an owner", scores[0]["warnings"])
        self.assertIn("payments is missing a health check", scores[0]["warnings"])


if __name__ == "__main__":
    unittest.main()
