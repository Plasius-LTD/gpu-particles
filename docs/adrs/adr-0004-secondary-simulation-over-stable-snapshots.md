# ADR-0004: Secondary Simulation over Stable Snapshots

- Status: Accepted
- Date: 2026-03-19

## Context

The ray-tracing-first world architecture separates authoritative simulation from
visual state. Particle systems that react to world motion, collisions, wind, or
surface state should consume a stable post-solve snapshot rather than in-flight
physics state.

`@plasius/gpu-particles` already publishes DAG worker manifests, but it did not
yet expose a formal contract describing which effects require stable physics
snapshots and which effects remain standalone visual work.

## Decision

`@plasius/gpu-particles` will publish a secondary simulation plan per effect.

The plan states:

- whether a stable world snapshot is required,
- the expected snapshot producer and handoff stage,
- how the effect stages map onto the worker DAG,
- the degradation order for secondary simulation under pressure.

Worker manifests also expose top-level secondary simulation metadata so
integrators can wire particles into `@plasius/gpu-physics`,
`@plasius/gpu-performance`, and `@plasius/gpu-debug` without package-local
conventions.

## Consequences

- World-reactive particle effects can be scheduled after stable simulation
  commits.
- Purely visual effects such as text overlays can remain standalone.
- Debug and performance packages can attribute secondary simulation correctly.
