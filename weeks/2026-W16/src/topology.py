from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
import json


@dataclass(frozen=True)
class Service:
    name: str
    depends_on: tuple[str, ...] = field(default_factory=tuple)
    owner: str = ""
    tier: str = ""
    has_healthcheck: bool = False


@dataclass
class ArchitectureGraph:
    services: dict[str, Service]

    def validate(self) -> list[str]:
        warnings: list[str] = []
        for name, service in self.services.items():
            for dependency in service.depends_on:
                if dependency not in self.services:
                    warnings.append(f"{name} depends on unknown service '{dependency}'")
            if not service.owner:
                warnings.append(f"{name} is missing an owner")
            if not service.has_healthcheck:
                warnings.append(f"{name} is missing a health check")
        return warnings

    def find_cycles(self) -> list[list[str]]:
        visited: set[str] = set()
        stack: list[str] = []
        active: set[str] = set()
        cycles: list[list[str]] = []
        seen_signatures: set[tuple[str, ...]] = set()

        def visit(node: str) -> None:
            visited.add(node)
            active.add(node)
            stack.append(node)
            for dependency in self.services[node].depends_on:
                if dependency not in self.services:
                    continue
                if dependency not in visited:
                    visit(dependency)
                elif dependency in active:
                    start = stack.index(dependency)
                    cycle = stack[start:] + [dependency]
                    signature = tuple(cycle)
                    if signature not in seen_signatures:
                        seen_signatures.add(signature)
                        cycles.append(cycle)
            stack.pop()
            active.remove(node)

        for node in sorted(self.services):
            if node not in visited:
                visit(node)
        return cycles

    def deployment_order(self) -> list[str]:
        self._raise_for_cycles()
        indegree = {name: len(service.depends_on) for name, service in self.services.items()}
        dependents: dict[str, set[str]] = {name: set() for name in self.services}
        for name, service in self.services.items():
            for dependency in service.depends_on:
                if dependency in dependents:
                    dependents[dependency].add(name)

        ready = deque(sorted(name for name, degree in indegree.items() if degree == 0))
        order: list[str] = []
        while ready:
            node = ready.popleft()
            order.append(node)
            for dependent in sorted(dependents[node]):
                indegree[dependent] -= 1
                if indegree[dependent] == 0:
                    ready.append(dependent)
        return order

    def blast_radius(self, service_name: str) -> list[str]:
        if service_name not in self.services:
            raise KeyError(f"Unknown service: {service_name}")
        reverse_edges: dict[str, set[str]] = {name: set() for name in self.services}
        for name, service in self.services.items():
            for dependency in service.depends_on:
                if dependency in reverse_edges:
                    reverse_edges[dependency].add(name)

        impacted: list[str] = []
        queue = deque(sorted(reverse_edges[service_name]))
        seen: set[str] = set()
        while queue:
            current = queue.popleft()
            if current in seen:
                continue
            seen.add(current)
            impacted.append(current)
            for dependent in sorted(reverse_edges[current]):
                if dependent not in seen:
                    queue.append(dependent)
        return impacted

    def review_summary(self, focus: str | None = None) -> dict[str, object]:
        cycles = self.find_cycles()
        summary: dict[str, object] = {
            "service_count": len(self.services),
            "warnings": self.validate(),
            "cycles": cycles,
        }
        if not cycles:
            summary["deployment_order"] = self.deployment_order()
        if focus:
            summary["focus_service"] = focus
            summary["blast_radius"] = self.blast_radius(focus)
        return summary

    def _raise_for_cycles(self) -> None:
        cycles = self.find_cycles()
        if cycles:
            formatted = "; ".join(" -> ".join(cycle) for cycle in cycles)
            raise ValueError(f"Cannot compute deployment order for cyclic graph: {formatted}")


def load_services(source: str | bytes | dict[str, object]) -> ArchitectureGraph:
    if isinstance(source, (str, bytes)):
        data = json.loads(source)
    else:
        data = source
    raw_services = data.get("services", [])
    services: dict[str, Service] = {}
    for item in raw_services:
        service = Service(
            name=item["name"],
            depends_on=tuple(item.get("depends_on", [])),
            owner=item.get("owner", ""),
            tier=item.get("tier", ""),
            has_healthcheck=bool(item.get("has_healthcheck", False)),
        )
        services[service.name] = service
    return ArchitectureGraph(services)


def load_services_from_file(path: str) -> ArchitectureGraph:
    with open(path, "r", encoding="utf-8") as handle:
        return load_services(handle.read())
