# Architectural Decision Record (ADR)

## Title

Effect Catalog and Job Separation

---

## Status

- Accepted
- Date: 2026-01-29
- Version: 1.0
- Supersedes: N/A
- Superseded by: N/A

---

## Tags

gpu, wgsl, particles, effects

---

## Context

The particles package needs to support multiple particle effect types (fire,
sparks, text overlays, rain, snow). Each effect should provide its own prelude
and job WGSL modules so that consumers can selectively register only the
necessary jobs with `@plasius/gpu-worker`.

---

## Decision

Adopt an effect catalog structure under `src/effects/<effect>/` where each
folder contains a `prelude.wgsl` and per-job WGSL modules. Provide a catalog API
that exposes available effects and allows loading an effect's prelude and jobs
for use with gpu-worker's assembly pipeline.

---

## Alternatives Considered

- **Single monolithic WGSL file**: prevents selective job registration and
  effect reuse.
- **Keep only the fire demo files**: blocks expansion to new effect types.
- **Separate packages per effect**: increases maintenance overhead and makes
  cross-effect sharing harder.

---

## Consequences

- Consumers can load only the effect modules they need.
- Each effect can evolve independently while sharing the same loader API.
- Placeholder WGSL modules must be completed for production-quality effects.

---

## Related Decisions

- ADR-0001: Particle WGSL Jobs for gpu-worker

---

## References

- gpu-worker WGSL assembly API (`assembleWorkerWgsl`).
