# Architectural Decision Record (ADR)

## Title

Particle WGSL Jobs for gpu-worker

---

## Status

- Accepted
- Date: 2026-01-29
- Version: 1.0
- Supersedes: N/A
- Superseded by: N/A

---

## Tags

wgsl, gpu, particles, worker

---

## Context

We need a reusable particle simulation module that integrates cleanly with
`@plasius/gpu-worker`. The particle shaders should be split into job-sized WGSL
modules so they can be registered individually in the worker assembly step.
The library should remain focused on gpu-worker usage rather than standalone
pipeline ownership.

---

## Decision

Create a dedicated `@plasius/gpu-particles` package that exports:
- A shared WGSL prelude for particle data/utility functions.
- Separate WGSL job modules (physics and render) each defining `process_job`.
- Loader helpers and URLs that map onto the gpu-worker assembly workflow.

---

## Alternatives Considered

- **Keep jobs inside gpu-worker demo**: Not reusable and makes integration harder.
- **Monolithic WGSL file**: Prevents selective job registration and reuse.
- **Standalone render pipeline package**: Over-scopes the package beyond worker jobs.

---

## Consequences

- Jobs can be assembled selectively with gpu-worker and share a consistent prelude.
- Consumers must provide the expected bind group layout for the particle jobs.
- Additional package maintenance and release process is required.

---

## Related Decisions

- None.

---

## References

- gpu-worker WGSL assembly API (`assembleWorkerWgsl`).
