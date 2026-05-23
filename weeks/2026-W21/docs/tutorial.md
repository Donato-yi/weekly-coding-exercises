# Architecture Fitness Notes

The service map is intentionally small: services declare a layer, package owner, and list of dependencies. The analyzer checks five things now:

- dependencies point at services that actually exist
- explicit forbidden source/target pairs are not crossed
- layer order moves in the intended direction, such as edge -> application -> domain
- package ownership boundaries are respected
- dependency cycles are reported in stable order

This kind of tool is useful before it becomes a CI gate. Start by publishing the report on pull requests, then promote high-confidence rules to blocking checks after the team trusts the signal.

Example:

    python src/cli.py analyze demos/problematic-system.json --output demos/generated-report.json

The command exits with code 1 when it finds architecture violations, which makes it easy to wire into automation later.

Layer rules are configured with a top-down `layer_order`. A service may depend on its own layer or a deeper layer, but not upward. Package rules are configured with `ownership_boundaries`, where each package lists the other packages it may call directly.

For pull request review, use markdown output:

    python src/cli.py analyze demos/problematic-system.json --format markdown --output demos/generated-report.md

The markdown report keeps counts at the top and then groups each finding into a small review note with the service, dependency, and rule detail.

To track whether drift is getting better or worse, compare the current run with a previous JSON report:

    python src/cli.py analyze demos/problematic-system.json --baseline demos/baseline-report.json --output demos/generated-report.json

The report adds a baseline object with fixed, introduced, and unchanged findings. Treat introduced violations as review blockers first, because they represent new drift even when the total violation count still looks small.

Saturday's addition is a remediation plan. JSON and markdown reports now include a prioritized list of suggested next actions. Missing dependencies and cycles are high priority because they usually mean the map is stale or the service graph can deadlock ownership decisions. Explicit boundary violations stay medium priority unless the team decides to promote a specific rule to a release gate.

Use the companion adoption playbook when applying the checks to a real repository:

    docs/adoption-playbook.md

The short version is to map real modules to services first, run the analyzer in reporting mode, tune noisy rules, then add the markdown output to pull requests before making any rule blocking.
