from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any


class ConfigError(ValueError):
    """Raised when the architecture map cannot be loaded."""


@dataclass(frozen=True)
class Service:
    name: str
    layer: str
    dependencies: tuple[str, ...]


@dataclass(frozen=True)
class ForbiddenDependency:
    source: str
    target: str
    reason: str


@dataclass(frozen=True)
class ArchitectureMap:
    services: dict[str, Service]
    forbidden: tuple[ForbiddenDependency, ...]


@dataclass(frozen=True)
class Violation:
    kind: str
    service: str
    dependency: str | None
    message: str

    def to_dict(self) -> dict[str, str | None]:
        return {
            "kind": self.kind,
            "service": self.service,
            "dependency": self.dependency,
            "message": self.message,
        }


def load_architecture(path: str | Path) -> ArchitectureMap:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ConfigError("architecture map must be a JSON object")

    services_raw = raw.get("services")
    if not isinstance(services_raw, list) or not services_raw:
        raise ConfigError("services must be a non-empty list")

    services: dict[str, Service] = {}
    for item in services_raw:
        service = _parse_service(item)
        if service.name in services:
            raise ConfigError(f"duplicate service: {service.name}")
        services[service.name] = service

    forbidden = tuple(_parse_forbidden(item) for item in raw.get("forbidden_dependencies", []))
    return ArchitectureMap(services=services, forbidden=forbidden)


def analyze(architecture: ArchitectureMap) -> dict[str, Any]:
    violations: list[Violation] = []
    violations.extend(_missing_dependency_violations(architecture))
    violations.extend(_forbidden_dependency_violations(architecture))
    violations.extend(_cycle_violations(architecture))
    violations.sort(key=lambda item: (item.kind, item.service, item.dependency or "", item.message))

    return {
        "service_count": len(architecture.services),
        "dependency_count": sum(len(service.dependencies) for service in architecture.services.values()),
        "violation_count": len(violations),
        "violations": [violation.to_dict() for violation in violations],
    }


def _parse_service(item: object) -> Service:
    if not isinstance(item, dict):
        raise ConfigError("each service must be an object")

    name = _required_string(item, "name")
    layer = _required_string(item, "layer")
    deps_raw = item.get("dependencies", [])
    if not isinstance(deps_raw, list) or not all(isinstance(dep, str) for dep in deps_raw):
        raise ConfigError(f"dependencies for {name} must be a list of strings")

    return Service(name=name, layer=layer, dependencies=tuple(sorted(deps_raw)))


def _parse_forbidden(item: object) -> ForbiddenDependency:
    if not isinstance(item, dict):
        raise ConfigError("each forbidden dependency rule must be an object")
    return ForbiddenDependency(
        source=_required_string(item, "source"),
        target=_required_string(item, "target"),
        reason=_required_string(item, "reason"),
    )


def _required_string(item: dict[str, object], key: str) -> str:
    value = item.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ConfigError(f"{key} must be a non-empty string")
    return value.strip()


def _missing_dependency_violations(architecture: ArchitectureMap) -> list[Violation]:
    services = architecture.services
    violations: list[Violation] = []
    for service in services.values():
        for dependency in service.dependencies:
            if dependency not in services:
                violations.append(
                    Violation(
                        kind="missing_dependency",
                        service=service.name,
                        dependency=dependency,
                        message=f"{service.name} depends on unknown service {dependency}",
                    )
                )
    return violations


def _forbidden_dependency_violations(architecture: ArchitectureMap) -> list[Violation]:
    rules = {(rule.source, rule.target): rule for rule in architecture.forbidden}
    violations: list[Violation] = []
    for service in architecture.services.values():
        for dependency in service.dependencies:
            rule = rules.get((service.name, dependency))
            if rule:
                violations.append(
                    Violation(
                        kind="forbidden_dependency",
                        service=service.name,
                        dependency=dependency,
                        message=rule.reason,
                    )
                )
    return violations


def _cycle_violations(architecture: ArchitectureMap) -> list[Violation]:
    graph = {
        name: [dep for dep in service.dependencies if dep in architecture.services]
        for name, service in architecture.services.items()
    }
    cycles = _find_cycles(graph)
    return [
        Violation(
            kind="cycle",
            service=cycle[0],
            dependency=cycle[1] if len(cycle) > 1 else cycle[0],
            message="dependency cycle: " + " -> ".join(cycle + [cycle[0]]),
        )
        for cycle in cycles
    ]


def _find_cycles(graph: dict[str, list[str]]) -> list[list[str]]:
    cycles: set[tuple[str, ...]] = set()

    def visit(node: str, path: list[str]) -> None:
        if node in path:
            cycle = path[path.index(node) :]
            cycles.add(_normalize_cycle(cycle))
            return
        for dependency in graph.get(node, []):
            visit(dependency, path + [node])

    for node in sorted(graph):
        visit(node, [])
    return [list(cycle) for cycle in sorted(cycles)]


def _normalize_cycle(cycle: list[str]) -> tuple[str, ...]:
    rotations = [tuple(cycle[index:] + cycle[:index]) for index in range(len(cycle))]
    return min(rotations)
