import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from src.topology import load_services


VALID_TOPOLOGY = {
    "services": [
        {"name": "identity", "depends_on": [], "owner": "platform", "tier": "core", "has_healthcheck": True},
        {"name": "catalog", "depends_on": ["identity"], "owner": "commerce", "tier": "core", "has_healthcheck": True},
        {"name": "payments", "depends_on": ["identity"], "owner": "commerce", "tier": "critical", "has_healthcheck": True},
        {"name": "edge-gateway", "depends_on": ["catalog", "payments"], "owner": "platform", "tier": "edge", "has_healthcheck": True},
    ]
}


class TopologyTests(unittest.TestCase):
    def test_deployment_order_is_dependency_first(self) -> None:
        graph = load_services(VALID_TOPOLOGY)
        self.assertEqual(graph.deployment_order(), ["identity", "catalog", "payments", "edge-gateway"])

    def test_blast_radius_follows_reverse_dependencies(self) -> None:
        graph = load_services(VALID_TOPOLOGY)
        self.assertEqual(graph.blast_radius("identity"), ["catalog", "payments", "edge-gateway"])

    def test_validate_reports_missing_metadata_and_unknown_dependencies(self) -> None:
        graph = load_services(
            {
                "services": [
                    {"name": "api", "depends_on": ["db"], "tier": "critical", "has_healthcheck": False},
                ]
            }
        )
        warnings = graph.validate()
        self.assertIn("api depends on unknown service 'db'", warnings)
        self.assertIn("api is missing an owner", warnings)
        self.assertIn("api is missing a health check", warnings)

    def test_cycle_detection_and_order_failure(self) -> None:
        graph = load_services(
            {
                "services": [
                    {"name": "a", "depends_on": ["b"], "owner": "team-a", "has_healthcheck": True},
                    {"name": "b", "depends_on": ["a"], "owner": "team-b", "has_healthcheck": True},
                ]
            }
        )
        self.assertEqual(graph.find_cycles(), [["a", "b", "a"]])
        with self.assertRaises(ValueError):
            graph.deployment_order()


if __name__ == "__main__":
    unittest.main()
