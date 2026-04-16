import pytest

from topology import load_services


VALID_TOPOLOGY = {
    "services": [
        {"name": "identity", "depends_on": [], "owner": "platform", "has_healthcheck": True},
        {"name": "catalog", "depends_on": ["identity"], "owner": "commerce", "has_healthcheck": True},
        {"name": "payments", "depends_on": ["identity"], "owner": "commerce", "has_healthcheck": True},
        {"name": "edge-gateway", "depends_on": ["catalog", "payments"], "owner": "platform", "has_healthcheck": True},
    ]
}


def test_deployment_order_is_dependency_first():
    graph = load_services(VALID_TOPOLOGY)
    assert graph.deployment_order() == ["identity", "catalog", "payments", "edge-gateway"]


def test_blast_radius_follows_reverse_dependencies():
    graph = load_services(VALID_TOPOLOGY)
    assert graph.blast_radius("identity") == ["catalog", "payments", "edge-gateway"]


def test_validate_reports_missing_metadata_and_unknown_dependencies():
    graph = load_services(
        {
            "services": [
                {"name": "api", "depends_on": ["db"], "has_healthcheck": False},
            ]
        }
    )
    warnings = graph.validate()
    assert "api depends on unknown service 'db'" in warnings
    assert "api is missing an owner" in warnings
    assert "api is missing a health check" in warnings


def test_cycle_detection_and_order_failure():
    graph = load_services(
        {
            "services": [
                {"name": "a", "depends_on": ["b"], "owner": "team-a", "has_healthcheck": True},
                {"name": "b", "depends_on": ["a"], "owner": "team-b", "has_healthcheck": True},
            ]
        }
    )
    cycles = graph.find_cycles()
    assert cycles == [["a", "b", "a"]]
    with pytest.raises(ValueError):
        graph.deployment_order()
