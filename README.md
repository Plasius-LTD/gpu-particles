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

## Effects
- `fire` (default, torch-style flame + smoke)
- `sparks` (burst scatter)
- `text` (numeric overlay particles)
- `rain` (falling streaks)
- `snow` (drifting flakes)
- `firework` (explosions with sparks, smoke, ash)

## Demo
Run the demo server from the repo root so the demo can import gpu-worker and the
queue WGSL sources:
```
cd gpu-particles
npm run demo
```
Then open `http://localhost:8000/gpu-particles/demo/`.

## What this is
- Effect-specific WGSL preludes plus per-job kernels.
- Jobs designed to be appended into the gpu-worker WGSL assembly step.
- Individual shaders/initializers split into separate WGSL modules for selective registration.

## Files
- `src/effects/fire/prelude.wgsl`: Shared particle data structs + helpers.
- `src/effects/fire/physics.job.wgsl`: Job kernel to enqueue and integrate particles.
- `src/effects/fire/render.job.wgsl`: Job kernel to build render worklists/indirect args.
- `src/effects/*/*`: Effect-specific preludes and jobs.
- `src/index.js`: URL helpers + WGSL loaders.
