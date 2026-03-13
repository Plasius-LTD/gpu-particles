# Worker-First Particle Integration

## Goals

- Keep particle effects aligned to `gpu-worker`.
- Provide ready-to-consume budget ladders for `gpu-performance`.
- Provide opt-in debug descriptors for `gpu-debug`.

## Manifest Shape

Each particle effect publishes a manifest with:

- owner: `particles`
- suggested allocation ids for key GPU resources
- per-job worker, performance, and debug contracts

Update jobs use the `simulation` queue class and render jobs use the `render`
queue class so the runtime can balance them independently.

## Consumer Usage

1. Load a particle worker bundle for the chosen effect.
2. Register WGSL jobs with `gpu-worker`.
3. Convert `performance` entries into worker-budget adapters in
   `gpu-performance`.
4. When debug is enabled, map `debug` entries into local `gpu-debug` samples.

## Initial Budget Guidance

- Fire and firework effects keep richer simulation ladders because their update
  work dominates cost.
- Sparks, rain, and snow expose lighter-weight presets tuned for density-driven
  degradation.
- Text effects keep both jobs in the render lane because layout is purely
  visual.
