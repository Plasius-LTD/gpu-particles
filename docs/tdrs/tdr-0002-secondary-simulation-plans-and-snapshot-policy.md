# TDR-0002: Secondary Simulation Plans and Snapshot Policy

## Summary

`@plasius/gpu-particles` exports `createParticleSecondarySimulationPlan(effect?)`
and attaches `secondarySimulation` metadata to each worker manifest.

## Snapshot policy

Two policy modes exist:

- `stable-world-snapshot`
- `standalone-visual`

Most world-reactive effects require a stable physics snapshot from
`physics.worldSnapshot` with `post-authoritative-commit` stability. The `text`
effect remains standalone because it is not world-reactive secondary
simulation.

## Plan contract

The plan includes:

- effect name,
- scheduler mode,
- root job ids,
- stage definitions derived from the worker manifest,
- snapshot policy,
- degradation order for budget pressure.

## Rationale

This keeps the particle package aligned with the simulation-to-visual split in
the renderer architecture while preserving existing DAG-ready worker manifests.
