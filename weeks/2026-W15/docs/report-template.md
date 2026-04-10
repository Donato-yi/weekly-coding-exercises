# Weekly Repo Health Report

Generated: {{generatedAt}}

## Summary
- Repos scanned: {{summary.reposScanned}}
- Dirty repos: {{summary.dirtyRepos}}
- Test failures: {{summary.testFailures}}
- Lint failures: {{summary.lintFailures}}
- Dependency manifests detected: {{summary.dependencyManifests}}

## Repos
- {{repo.name}} — path: {{repo.path}}
  - git: {{repo.gitDirty ? "dirty" : "clean"}} ({{repo.gitChanges}} changes)
  - tests: exit={{repo.testResult.exitCode}} ({{repo.testResult.durationMs}}ms)
  - lint: exit={{repo.lintResult.exitCode}} ({{repo.lintResult.durationMs}}ms)
  - deps: {{repo.dependency.manager}} (direct={{repo.dependency.directCount}}, dev={{repo.dependency.devCount}})
  - changelog: {{repo.changelog.commitCount}} commits ({{repo.changelog.range}})
  - highlights:
    - {{repo.changelog.highlights[0]}}
