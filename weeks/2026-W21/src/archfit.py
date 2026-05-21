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
    package: str
    dependencies: tuple[str, ...]


@dataclass(frozen=True)
class ForbiddenDependency:
    source: str
    target: str
    reason: str


@dataclass(frozen=True)
class OwnershipBoundary:
    package: str
    allowed_dependency_packages: tuple[str, ...]
    reason: str


@dataclass(frozen=True)
class ArchitectureMap:
    services: dict[str, Service]
    forbidden: tuple[ForbiddenDependency, ...]
    layer_order: tuple[str, ...]
    ownership_boundaries: tuple[OwnershipBoundary, ...]


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
    layer_order = _parse_layer_order(raw.get("layer_order", []))
    ownership_boundaries = tuple(
        _parse_ownership_boundary(item) for item in raw.get("ownership_boundaries", [])
    )
    return ArchitectureMap(
        services=services,
        forbidden=forbidden,
        layer_order=layer_order,
        ownership_boundaries=ownership_boundaries,
    )


def analyze(architecture: ArchitectureMap) -> dict[str, Any]:
    violations: list[Violation] = []
    violations.extend(_missing_dependency_violations(architecture))
    violations.extend(_forbidden_dependency_violations(architecture))
    violations.extend(_layer_order_violations(architecture))
    violations.extend(_ownership_boundary_violations(architecture))
    violations.extend(_cycle_violations(architecture))
    violations.sort(key=lambda item: (item.kind, item.service, item.dependency or "", item.message))

    return {
        "service_count": len(architecture.services),
        "dependency_count": sum(len(service.dependencies) for service in architecture.services.values()),
        "violation_count": len(violations),
        "violations": [violation.to_dict() for violation in violations],
    }


def render_markdown_report(report: dict[str, Any]) -> str:
    lines = [
        "# Architecture Fitness Report",
        "",
        "## Summary",
        f"- Services: {report['service_count']}",
        f"- Dependencies: {report['dependency_count']}",
        f"- Violations: {report['violation_count']}",
        "",
    ]

    violations = report.get("violations", [])
    if not violations:
        lines.extend(["## Review Notes", "- No architecture violations found."])
        return "\n".join(lines) + "\n"

    lines.append("## Review Notes")
    for violation in violations:
        dependency = violation.get("dependency") or "n/a"
        lines.extend(
            [
                f"### {violation['kind']}: {violation['service']} -> {dependency}",
                f"- Service: {violation['service']}",
                f"- Dependency: {dependency}",
                f"- Detail: {violation['message']}",
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def _parse_service(item: object) -> Service:
    if not isinstance(item, dict):
        raise ConfigError("each service must be an object")

    name = _required_string(item, "name")
    layer = _required_string(item, "layer")
    deps_raw = item.get("dependencies", [])
    if not isinstance(deps_raw, list) or not all(isinstance(dep, str) for dep in deps_raw):
        raise ConfigError(f"dependencies for {name} must be a list of strings")

    package = item.get("package", name)
    if not isinstance(package, str) or not package.strip():
        raise ConfigError(f"package for {name} must be a non-empty string")

    return Service(name=name, layer=layer, package=package.strip(), dependencies=tuple(sorted(deps_raw)))


def _parse_forbidden(item: object) -> ForbiddenDependency:
    if not isinstance(item, dict):
        raise ConfigError("each forbidden dependency rule must be an object")
    return ForbiddenDependency(
        source=_required_string(item, "source"),
        target=_required_string(item, "target"),
        reason=_required_string(item, "reason"),
    )


def _parse_layer_order(value: object) -> tuple[str, ...]:
    if value in (None, []):
        return ()
    if not isinstance(value, list) or not all(isinstance(layer, str) and layer.strip() for layer in value):
        raise ConfigError("layer_order must be a list of non-empty strings")
    normalized = tuple(layer.strip() for layer in value)
    if len(set(normalized)) != len(normalized):
        raise ConfigError("layer_order must not contain duplicates")
    return normalized


def _parse_ownership_boundary(item: object) -> OwnershipBoundary:
    if not isinstance(item, dict):
        raise ConfigError("each ownership boundary must be an object")

    allowed_raw = item.get("allowed_dependency_packages", [])
    if not isinstance(allowed_raw, list) or not all(
        isinstance(package, str) and package.strip() for package in allowed_raw
    ):
        raise ConfigError("allowed_dependency_packages must be a list of non-empty strings")

    return OwnershipBoundary(
        package=_required_string(item, "package"),
        allowed_dependency_packages=tuple(sorted(package.strip() for package in allowed_raw)),
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


def _layer_order_violations(architecture: ArchitectureMap) -> list[Violation]:
    if not architecture.layer_order:
        return []

    layer_rank = {layer: rank for rank, layer in enumerate(architecture.layer_order)}
    violations: list[Violation] = []
    for service in architecture.services.values():
        if service.layer not in layer_rank:
            violations.append(
                Violation(
                    kind="unknown_layer",
                    service=service.name,
                    dependency=None,
                    message=f"{service.name} uses layer {service.layer}, which is not in layer_order",
                )
            )
            continue

        for dependency_name in service.dependencies:
            dependency = architecture.services.get(dependency_name)
            if dependency is None:
                continue
            if dependency.layer not in layer_rank:
                violations.append(
                    Violation(
                        kind="unknown_layer",
                        service=dependency.name,
                        dependency=None,
                        message=f"{dependency.name} uses layer {dependency.layer}, which is not in layer_order",
                    )
                )
                continue
            if layer_rank[service.layer] > layer_rank[dependency.layer]:
                violations.append(
                    Violation(
                        kind="layer_order",
                        service=service.name,
                        dependency=dependency.name,
                        message=(
                            f"{service.name} ({service.layer}) must not depend upward on "
                            f"{dependency.name} ({dependency.layer})"
                        ),
                    )
                )
    return violations


def _ownership_boundary_violations(architecture: ArchitectureMap) -> list[Violation]:
    rules = {rule.package: rule for rule in architecture.ownership_boundaries}
    if not rules:
        return []

    violations: list[Violation] = []
    for service in architecture.services.values():
        rule = rules.get(service.package)
        if not rule:
            continue
        allowed = set(rule.allowed_dependency_packages) | {service.package}
        for dependency_name in service.dependencies:
            dependency = architecture.services.get(dependency_name)
            if dependency and dependency.package not in allowed:
                violations.append(
                    Violation(
                        kind="ownership_boundary",
                        service=service.name,
                        dependency=dependency.name,
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
