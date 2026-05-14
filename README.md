# @plasius/gpu-particles

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-particles.svg)](https://www.npmjs.com/package/@plasius/gpu-particles)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-particles/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-particles/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/gpu-particles)](https://codecov.io/gh/Plasius-LTD/gpu-particles)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-particles)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

[![license](https://img.shields.io/github/license/Plasius-LTD/gpu-particles)](./LICENSE)

Particle job WGSL modules designed to be assembled with `@plasius/gpu-worker`.
Each effect ships a prelude and one or more job WGSL modules that define
`process_job` and are intended to be appended via `assembleWorkerWgsl`.

Apache-2.0. ESM + CJS builds. WGSL assets are published in `dist/`.

## Install
```
npm install @plasius/gpu-particles
```

## Usage (default effect)
```js
import {
  loadParticlePreludeWgsl,
  loadParticlePhysicsJobWgsl,
  loadParticleRenderJobWgsl,
  particleJobLabels,
} from "@plasius/gpu-particles";
import { assembleWorkerWgsl, loadWorkerWgsl } from "@plasius/gpu-worker";

const workerWgsl = await loadWorkerWgsl();
const preludeWgsl = await loadParticlePreludeWgsl();
const physicsJob = await loadParticlePhysicsJobWgsl();
const renderJob = await loadParticleRenderJobWgsl();

const shaderCode = await assembleWorkerWgsl(workerWgsl, {
  preludeWgsl,
  jobs: [
    { wgsl: physicsJob, label: particleJobLabels.physics },
    { wgsl: renderJob, label: particleJobLabels.render },
  ],
});
```

## Usage (select an effect)
```js
import { loadParticleEffectJobs } from "@plasius/gpu-particles";
import { assembleWorkerWgsl, loadWorkerWgsl } from "@plasius/gpu-worker";

const workerWgsl = await loadWorkerWgsl();
const { preludeWgsl, jobs } = await loadParticleEffectJobs("rain");

const shaderCode = await assembleWorkerWgsl(workerWgsl, {
  preludeWgsl,
  jobs,
});
```

## Usage (worker governance bundle)

```js
import {
  getParticleEffectWorkerManifest,
  loadParticleEffectWorkerBundle,
} from "@plasius/gpu-particles";

const bundle = await loadParticleEffectWorkerBundle("firework");

// WGSL payload for gpu-worker
console.log(bundle.preludeWgsl, bundle.jobs);

// Contract-aligned metadata for gpu-performance and gpu-debug integrations
console.log(bundle.workerManifest.jobs[0].performance.levels);
console.log(bundle.workerManifest.jobs[0].debug);
console.log(bundle.workerManifest.schedulerMode);
console.log(bundle.workerManifest.jobs[0].worker.priority);
console.log(bundle.workerManifest.jobs[0].worker.dependencies);

const manifest = getParticleEffectWorkerManifest("rain");
console.log(manifest.jobs.map((job) => job.worker.queueClass));
```

## Usage (secondary simulation plan)

```js
import {
  createParticleSecondarySimulationPlan,
  getParticleEffectWorkerManifest,
  particleSecondarySimulationPolicies,
} from "@plasius/gpu-particles";

const plan = createParticleSecondarySimulationPlan("firework");
const manifest = getParticleEffectWorkerManifest("firework");
const fireworkPolicy = particleSecondarySimulationPolicies.firework;

console.log(plan.snapshotPolicy.sourceStage);
console.log(plan.rootJobIds);
console.log(manifest.secondarySimulation.mode);
console.log(fireworkPolicy.frameBinding);
```

`particleSecondarySimulationPolicies` exposes the docs-first per-effect snapshot
contract directly, while `createParticleSecondarySimulationPlan(...)` derives
stage ordering and degradation behavior from the corresponding worker manifest.

## DAG Scheduling

Particle worker manifests now publish `schedulerMode: "dag"` plus priorities
and dependencies.

- update/simulation/layout jobs start as roots for their effect.
- render jobs wait for all non-render jobs in the same effect before they become
  runnable.

That keeps visual submission ordered behind simulation or layout work without
introducing blocking coordination on the CPU.

## Effects
- `fire` (default, torch-style flame + smoke)
- `sparks` (burst scatter)
- `text` (numeric overlay particles)
- `rain` (falling streaks)
- `snow` (drifting flakes)
- `firework` (explosions with sparks, smoke, ash)
- All listed effects now include non-placeholder GPU render jobs for worker scheduling.

## Demo
Run the demo server from the repo root so the demo can import gpu-worker and the
queue WGSL sources:
```
cd gpu-particles
npm run demo
```
Then open `http://localhost:8000/gpu-particles/demo/`.

The demo mounts the shared `@plasius/gpu-shared` 3D harbor surface and rotates
through particle effects in world space. Effect worker manifests, stable
snapshot policy, root jobs, and render stages stay visible in context while
`@plasius/gpu-particles` continues to own effect selection and worker metadata
instead of a package-local 2D preview surface.

## Development Checks

```sh
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run pack:check
```

## What this is
- Effect-specific WGSL preludes plus per-job kernels.
- Jobs designed to be appended into the gpu-worker WGSL assembly step.
- Individual shaders/initializers split into separate WGSL modules for selective registration.

## Files
- `demo/index.html`: Browser demo shell and import map for shared runtime wiring.
- `demo/main.js`: Shared 3D harbor validation scene driven by particle effect
  manifests and stable-snapshot policy.
- `src/effects/fire/prelude.wgsl`: Shared particle data structs + helpers.
- `src/effects/fire/physics.job.wgsl`: Job kernel to enqueue and integrate particles.
- `src/effects/fire/render.job.wgsl`: Job kernel to build render worklists/indirect args.
- `src/effects/*/*`: Effect-specific preludes and jobs.
- `src/index.js`: URL helpers + WGSL loaders.
- `docs/tdrs/*`: technical design records for worker manifests and debug hooks.
- `docs/design/*`: integration guidance for worker budgets, DAG metadata, and debug instrumentation.
- `docs/design/secondary-simulation-integration.md`: stable-snapshot integration policy for world-reactive effects.
