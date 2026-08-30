# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

---

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - Pinned patched transitive npm dependencies to clear the current audit baseline.
  - Added fail-closed source and npm-package admission for the administrative contributor registry and pinned the CI/CD runtime to Node.js 24.18.0 LTS.
  - (placeholder)

## [0.1.17] - 2026-07-10

- **Added**
  - (placeholder)

- **Changed**
  - Updated the stable `@plasius/gpu-shared` dependency to the 1.x public
    runtime line and `@plasius/gpu-worker` to the 0.3.x DAG-ready runtime line.
  - Refreshed direct development tooling to the latest stable Playwright,
    ESLint, Globals, and TypeScript releases used by this package.
  - Regenerated the lockfile from a clean Node 24 install and documented the
    published runtime contract checks used by the package test suite.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.16] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.15] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - Replaced placeholder particle render jobs with active WGSL kernels in all
    shipped effect modules and added placeholder-regression coverage.

- **Security**
  - (placeholder)

## [0.1.12] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.11] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.10] - 2026-04-02

- **Added**
  - Exported `particleSecondarySimulationPolicies` so integrators can consume
    the per-effect stable-snapshot contract directly alongside the derived
    secondary simulation plans.
  - Contract tests that keep the demo on the public `@plasius/gpu-shared`
    browser import surface and lock the secondary simulation policy export.

- **Changed**
  - Updated the README to describe the live 3D particle scene, visible
    worker-manifest state, and direct secondary simulation policy export.

- **Fixed**
  - Removed the demo's deep import of `@plasius/gpu-shared` internals in favor
    of an import-map-backed package import.

- **Security**
  - (placeholder)

## [0.1.9] - 2026-03-23

- **Added**
  - Secondary simulation plans that describe how particle effects consume stable
    world snapshots or remain standalone visual effects.
  - ADR, TDR, design docs, and tests for the stable snapshot integration
    policy.

- **Changed**
  - Worker manifests now publish top-level `secondarySimulation` metadata so
    integrators can wire effects against `physics.worldSnapshot` explicitly.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.8] - 2026-03-14

- **Added**
  - (placeholder)

- **Changed**
  - Raised the minimum `@plasius/gpu-worker` dependency to `^0.1.10` so npm
    installs resolve the published DAG-ready worker runtime by default.
  - Updated GitHub Actions workflows to run JavaScript actions on Node 24,
    refreshed core workflow action versions, and switched Codecov uploads to
    the Codecov CLI.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.7] - 2026-03-13

- **Added**
  - Worker governance manifests and bundle loaders that align particle jobs with
    `gpu-worker`, `gpu-performance`, and `gpu-debug` integration contracts.
  - ADR, TDR, and design documentation for worker-first particle integration.
  - DAG scheduler metadata so render jobs can depend on simulation/layout jobs
    within each particle effect.

- **Changed**
  - README now documents particle worker manifests, performance budget ladders,
    DAG metadata, and debug metadata expectations for consumers.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.6] - 2026-03-04

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.2] - 2026-03-01

- **Added**
  - `lint`, `typecheck`, and security audit scripts for local and CI enforcement.

- **Changed**
  - CI now fails early on lint/typecheck/runtime dependency audit before build/test.

- **Fixed**
  - Pack-check regex cleanup to remove an unnecessary path escape.

- **Security**
  - Runtime dependency vulnerability checks are now enforced in CI.

## [0.1.1] - 2026-02-28

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.0] - 2026-01-29

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.0] - 2026-01-29

- **Added**
  - Effect catalog with fire, sparks, text, rain, and snow WGSL modules.
  - Effect-aware loaders for selecting per-effect preludes and jobs.
  - Multi-scene demo showcasing fire, sparks, text, rain, and snow effects.
  - Firework composite effect (explosions, sparks, smoke, ash) and demo scene.


[0.1.0]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.0

## [0.1.0] - 2026-02-11

- **Added**
  - Initial release.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)
[0.1.1]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.1
[0.1.2]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.2
[0.1.6]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.6
[0.1.7]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.7
[0.1.8]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.8
[0.1.9]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.9
[0.1.10]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.10
[0.1.11]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.11
[0.1.12]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.12
[0.1.15]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.15
[0.1.16]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.16
[0.1.17]: https://github.com/Plasius-LTD/gpu-particles/releases/tag/v0.1.17
