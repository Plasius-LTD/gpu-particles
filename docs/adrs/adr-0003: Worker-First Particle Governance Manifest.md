# Architectural Decision Record (ADR)

## Title

Worker-First Particle Governance Manifest

---

## Status

- Accepted
- Date: 2026-03-13
- Version: 1.0
- Supersedes: N/A
- Superseded by: N/A

---

## Tags

worker, performance, debug, particles

---

## Context

`@plasius/gpu-particles` already publishes effect-specific WGSL jobs for
`@plasius/gpu-worker`, but first-wave rollout now requires particle packages to
also express worker-budget and debug metadata in a form that consumers can wire
into `@plasius/gpu-performance` and `@plasius/gpu-debug`.

---

## Decision

Publish a worker governance manifest per particle effect.

Each manifest records:

- stable `jobType` values aligned with worker job labels,
- render versus simulation queue classes,
- suggested performance budget ladders for worker-budget adapters,
- opt-in debug metadata such as owner, tags, and suggested allocation ids.

---

## Alternatives Considered

- **Leave governance in downstream apps only**: increases duplication and makes
  effect rollout inconsistent.
- **Depend directly on gpu-performance and gpu-debug runtime APIs**: would add
  unnecessary package coupling before those integrations stabilize.

---

## Consequences

- Consumers can load WGSL and governance metadata from one package surface.
- Particle update and render work can be balanced independently.
- Manifest presets will need tuning as real effect workloads mature.

---

## Related Decisions

- ADR-0001: Particle WGSL Jobs for gpu-worker
- ADR-0002: Effect Catalog and Job Separation

---

## References

- `@plasius/gpu-worker`
- `@plasius/gpu-performance`
- `@plasius/gpu-debug`
