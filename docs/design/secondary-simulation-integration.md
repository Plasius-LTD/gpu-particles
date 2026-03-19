# Secondary Simulation Integration

Particle effects now publish a secondary simulation contract that explains how
they should integrate with stable world snapshots.

## Stable-snapshot effects

These effects should consume the post-authoritative physics snapshot before
running their update stage:

- `fire`
- `sparks`
- `rain`
- `snow`
- `firework`

## Standalone effects

`text` remains a standalone visual effect. It does not depend on a physics
snapshot and can run from local layout state alone.

## Scheduler expectations

The effect plan is derived from the existing worker manifest:

- root simulation or layout jobs begin first
- render submission waits for the upstream non-render stages
- degradation should reduce update cadence and dispatch scale before sacrificing
  visible submission fidelity
