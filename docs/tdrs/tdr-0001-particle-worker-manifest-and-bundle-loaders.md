# Technical Design Record (TDR)

## Title

TDR-0001: Particle Worker Manifest and Bundle Loaders

## Status

- Proposed -> Accepted
- Date: 2026-03-13
- Version: 1.0
- Supersedes: N/A
- Superseded by: N/A

## Scope

Defines the worker-governance surface published by `@plasius/gpu-particles`.

## Context

The package already provides effect catalogs and WGSL loaders. Consumers now
also need a stable way to discover:

- worker job labels,
- suggested performance budget ladders,
- render versus simulation queue classes,
- debug ownership and resource tags.

## Design

The package publishes:

- `particleWorkerManifests`
- `getParticleEffectWorkerManifest(name)`
- `loadParticleEffectWorkerBundle(name, options)`

Worker manifests stay data-only so the package does not depend directly on the
runtime APIs of `gpu-performance` or `gpu-debug`.

## Data Contracts

Each manifest job contains:

- `worker.jobType`
- `worker.queueClass`
- `performance.id`
- `performance.domain`
- `performance.authority`
- `performance.importance`
- `performance.levels[]`
- `debug.owner`
- `debug.tags[]`
- `debug.suggestedAllocationIds[]`

## Operational Considerations

- Reliability: unknown effect names fail fast.
- Observability: queue classes and allocation ids create stable integration
  hooks.
- Security: manifests are static local data with no network behavior.
- Cost: bundle loaders reuse existing WGSL loader flows.

## Rollout and Migration

1. Keep existing WGSL loader APIs intact.
2. Add worker-manifest consumption in early adopter packages or apps.
3. Tune budget presets as real profiling data becomes available.

## Risks and Mitigations

- Risk: budget presets may not match all scenes.
  Mitigation: publish them as suggested defaults, not mandatory runtime policy.
- Risk: downstream consumers may overfit to current allocation ids.
  Mitigation: keep ids stable and document them as package-owned hints.

## Open Questions

- Whether future particle effects need more queue classes than simulation and
  render.
