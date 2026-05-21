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
