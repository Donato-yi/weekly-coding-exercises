# Architecture Fitness Report

## Summary
- Services: 4
- Dependencies: 6
- Violations: 5

## Review Notes
### cycle: api -> orders
- Service: api
- Dependency: orders
- Detail: dependency cycle: api -> orders -> api

### forbidden_dependency: web -> orders
- Service: web
- Dependency: orders
- Detail: edge services must call the API facade instead of domain services directly

### layer_order: orders -> api
- Service: orders
- Dependency: api
- Detail: orders (domain) must not depend upward on api (application)

### missing_dependency: api -> billing
- Service: api
- Dependency: billing
- Detail: api depends on unknown service billing

### ownership_boundary: warehouse -> orders
- Service: warehouse
- Dependency: orders
- Detail: fulfillment package must not reach into commerce internals directly

## Baseline Comparison
- Status: regressed
- Baseline violations: 4
- Current violations: 5
- Fixed: 0
- Introduced: 1
- Unchanged: 4

## Suggested Remediation
- high: api -> orders - Break the cycle with an event, interface, or dependency inversion point.
- high: api -> billing - Either add billing to the service map or remove the stale dependency from api.
- medium: web -> orders - Route web through the approved facade instead of calling orders directly.
- medium: orders -> api - Move shared behavior behind a lower-layer abstraction before orders calls api.
- medium: warehouse -> orders - Expose an owned API or event contract instead of direct package access from warehouse.
