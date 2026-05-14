import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const originalImportMetaUrl = globalThis.__IMPORT_META_URL__;
globalThis.__IMPORT_META_URL__ = new URL("../src/index.js", import.meta.url);
const {
  createParticleSecondarySimulationPlan,
  defaultParticleEffect,
  getParticleEffect,
  getParticleEffectWorkerManifest,
  particleEffectNames,
  particleEffects,
  particleJobLabels,
  particleJobs,
  particlePreludeWgslUrl,
  particlePhysicsJobWgslUrl,
  particleRenderJobWgslUrl,
  particleSecondarySimulationPolicies,
  particleSecondarySimulationModes,
  particleWorkerManifests,
  loadParticleEffectJobWgsl,
  loadParticleEffectJobs,
  loadParticleEffectPreludeWgsl,
  loadParticleEffectWorkerBundle,
  loadParticleJobs,
  loadParticlePhysicsJobWgsl,
  loadParticlePreludeWgsl,
  loadParticleRenderJobWgsl,
} = await import("../src/index.js");
if (typeof originalImportMetaUrl === "undefined") {
  delete globalThis.__IMPORT_META_URL__;
} else {
  globalThis.__IMPORT_META_URL__ = originalImportMetaUrl;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function urlToPath(url) {
  return fileURLToPath(url);
}

async function importParticleModuleWithBase(metaUrl, querySuffix) {
  const previous = globalThis.__IMPORT_META_URL__;
  globalThis.__IMPORT_META_URL__ = metaUrl;
  try {
    return await import(`../src/index.js?${querySuffix}`);
  } finally {
    if (typeof previous === "undefined") {
      delete globalThis.__IMPORT_META_URL__;
    } else {
      globalThis.__IMPORT_META_URL__ = previous;
    }
  }
}

test("particle effects expose WGSL files", () => {
  assert.ok(particleEffectNames.length > 0);
  for (const effectName of particleEffectNames) {
    const effect = particleEffects[effectName];
    assert.ok(effect, `Missing effect: ${effectName}`);
    assert.ok(fs.existsSync(urlToPath(effect.preludeUrl)));
    for (const job of effect.jobs) {
      assert.ok(fs.existsSync(urlToPath(job.url)));
    }
  }
});

test("default particle effect URLs point at fire job files", () => {
  assert.ok(particlePreludeWgslUrl instanceof URL);
  assert.ok(particlePhysicsJobWgslUrl instanceof URL);
  assert.ok(particleRenderJobWgslUrl instanceof URL);
  assert.ok(
    particlePreludeWgslUrl.pathname.endsWith(
      `/effects/${defaultParticleEffect}/prelude.wgsl`
    )
  );
  assert.ok(
    particlePhysicsJobWgslUrl.pathname.endsWith(
      `/effects/${defaultParticleEffect}/physics.job.wgsl`
    )
  );
  assert.ok(
    particleRenderJobWgslUrl.pathname.endsWith(
      `/effects/${defaultParticleEffect}/render.job.wgsl`
    )
  );
});

test("particle job WGSL defines process_job entry points", () => {
  for (const effectName of particleEffectNames) {
    const effect = particleEffects[effectName];
    for (const job of effect.jobs) {
      const source = fs.readFileSync(urlToPath(job.url), "utf8");
      assert.ok(/\bfn\s+process_job\b/.test(source));
    }
  }
});

test("render jobs are implemented and not placeholder stubs", () => {
  for (const effectName of particleEffectNames) {
    const effect = particleEffects[effectName];
    const render = effect.jobs.find((job) => job.key === "render");
    assert.ok(render, `Missing render job for ${effectName}`);
    const source = fs.readFileSync(urlToPath(render.url), "utf8");

    assert.ok(!/placeholder/i.test(source), `Render job is placeholder for ${effectName}`);
    assert.ok(!/let _ignore/.test(source), `Render job uses placeholder guard for ${effectName}`);
    assert.match(source, /particle_index/);
    assert.match(source, /arrayLength/);
    assert.match(source, /payload_words == 0u/);
  }
});

test("fire prelude WGSL includes shared structs", () => {
  const firePrelude = fs.readFileSync(
    path.resolve(
      projectRoot,
      "src",
      "effects",
      defaultParticleEffect,
      "prelude.wgsl"
    ),
    "utf8"
  );
  assert.ok(firePrelude.includes("struct Particle"));
  assert.ok(firePrelude.includes("struct EffectParams"));
});

test("lookup APIs reject unknown effect and job names", async () => {
  assert.throws(
    () => getParticleEffect("unknown-effect"),
    /Unknown particle effect/
  );
  await assert.rejects(
    () => loadParticleEffectJobWgsl("fire", "unknown-job"),
    /Unknown job/
  );
});

test("default wrapper loaders return fire prelude and jobs", async () => {
  const prelude = await loadParticlePreludeWgsl();
  assert.equal(typeof prelude, "string");
  assert.ok(prelude.includes("struct Particle"));

  const physicsJob = await loadParticlePhysicsJobWgsl();
  const renderJob = await loadParticleRenderJobWgsl();
  assert.ok(physicsJob.includes("process_job"));
  assert.ok(renderJob.includes("process_job"));

  const loaded = await loadParticleJobs();
  assert.equal(Array.isArray(loaded.jobs), true);
  assert.equal(loaded.jobs.length, particleJobs.length);
  assert.equal(loaded.jobs[0].label, particleJobLabels.physics);
  assert.equal(loaded.jobs[1].label, particleJobLabels.render);
});

test("effect-specific loader APIs return expected bundles", async () => {
  const sparksPrelude = await loadParticleEffectPreludeWgsl("sparks");
  assert.ok(sparksPrelude.includes("struct Particle"));

  const sparksUpdate = await loadParticleEffectJobWgsl("sparks", "update");
  assert.ok(sparksUpdate.includes("process_job"));

  const fireworkBundle = await loadParticleEffectJobs("firework");
  assert.equal(fireworkBundle.jobs.length, 2);
  assert.ok(
    fireworkBundle.jobs.every(
      (job) => typeof job.wgsl === "string" && job.wgsl.includes("process_job")
    )
  );
});

test("particle worker manifests expose performance and debug contracts", () => {
  assert.ok(particleWorkerManifests.fire);

  const manifest = getParticleEffectWorkerManifest("fire");
  assert.equal(manifest.owner, "particles");
  assert.equal(manifest.schedulerMode, "dag");
  assert.equal(manifest.jobs.length, particleEffects.fire.jobs.length);

  const physicsJob = manifest.jobs.find((job) => job.key === "physics");
  const renderJob = manifest.jobs.find((job) => job.key === "render");

  assert.equal(
    manifest.secondarySimulation.mode,
    particleSecondarySimulationModes.stableWorldSnapshot
  );
  assert.equal(manifest.secondarySimulation.sourceStage, "worldSnapshot");
  assert.equal(physicsJob.worker.queueClass, "simulation");
  assert.equal(physicsJob.worker.priority, 3);
  assert.deepEqual(physicsJob.worker.dependencies, []);
  assert.equal(physicsJob.performance.authority, "non-authoritative-simulation");
  assert.equal(renderJob.worker.queueClass, "render");
  assert.equal(renderJob.worker.priority, 2);
  assert.deepEqual(renderJob.worker.dependencies, ["particles.fire.physics"]);
  assert.equal(renderJob.performance.authority, "visual");
  assert.ok(renderJob.debug.suggestedAllocationIds.includes("particles.fire.indirect"));
});

test("worker bundle loaders pair WGSL and manifests for an effect", async () => {
  const bundle = await loadParticleEffectWorkerBundle("rain");
  assert.equal(bundle.effect, "rain");
  assert.equal(bundle.jobs.length, 2);
  assert.equal(bundle.workerManifest.effect, "rain");
  assert.equal(bundle.workerManifest.jobs.length, 2);
  assert.equal(bundle.secondarySimulationPlan.effect, "rain");
  assert.equal(bundle.secondarySimulationPlan.snapshotPolicy.required, true);
});

test("secondary simulation plans describe stable snapshot requirements", () => {
  const firePlan = createParticleSecondarySimulationPlan("fire");
  const textPlan = createParticleSecondarySimulationPlan("text");

  assert.equal(
    firePlan.snapshotPolicy.mode,
    particleSecondarySimulationModes.stableWorldSnapshot
  );
  assert.equal(firePlan.snapshotPolicy.sourceOwner, "physics");
  assert.equal(firePlan.snapshotPolicy.sourceStage, "worldSnapshot");
  assert.deepEqual(firePlan.rootJobIds, ["particles.fire.physics"]);
  assert.deepEqual(
    firePlan.stages.find((stage) => stage.key === "render").dependencies,
    ["particles.fire.physics"]
  );

  assert.equal(
    textPlan.snapshotPolicy.mode,
    particleSecondarySimulationModes.standaloneVisual
  );
  assert.equal(textPlan.snapshotPolicy.required, false);
  assert.equal(textPlan.snapshotPolicy.sourceStage, undefined);
  assert.deepEqual(textPlan.rootJobIds, ["particles.text.layout"]);
});

test("public secondary simulation policy export stays aligned with manifests and plans", () => {
  for (const effectName of particleEffectNames) {
    const policy = particleSecondarySimulationPolicies[effectName];
    const manifest = getParticleEffectWorkerManifest(effectName);
    const plan = createParticleSecondarySimulationPlan(effectName);

    assert.deepEqual(plan.snapshotPolicy, manifest.secondarySimulation);
    for (const [key, value] of Object.entries(policy)) {
      assert.equal(manifest.secondarySimulation[key], value);
      assert.equal(plan.snapshotPolicy[key], value);
    }
  }

  assert.equal(
    particleSecondarySimulationPolicies.fire.frameBinding,
    "same-frame"
  );
  assert.equal(
    particleSecondarySimulationPolicies.text.mode,
    particleSecondarySimulationModes.standaloneVisual
  );
});

test("fetcher branch supports non-file effect URLs", async () => {
  const module = await importParticleModuleWithBase(
    new URL("https://particles.example/pkg/index.js"),
    "fetch-success"
  );

  const prelude = await module.loadParticleEffectPreludeWgsl("fire", {
    fetcher: async () => ({
      ok: true,
      async text() {
        return "struct Particle { position: vec3f; };";
      },
    }),
  });

  assert.ok(prelude.includes("struct Particle"));
});

test("fetcher branch surfaces HTTP failure details", async () => {
  const module = await importParticleModuleWithBase(
    new URL("https://particles.example/pkg/index.js"),
    "fetch-error"
  );

  await assert.rejects(
    () =>
      module.loadParticleEffectPreludeWgsl("fire", {
        fetcher: async () => ({
          ok: false,
          status: 503,
          statusText: "Unavailable",
        }),
      }),
    /Failed to load WGSL \(503 Unavailable\)/
  );
});

test("demo imports gpu-shared through the public package surface", () => {
  const demoSource = fs.readFileSync(path.resolve(projectRoot, "demo", "main.js"), "utf8");
  const demoHtml = fs.readFileSync(path.resolve(projectRoot, "demo", "index.html"), "utf8");

  assert.match(demoSource, /from "@plasius\/gpu-shared"/);
  assert.doesNotMatch(demoSource, /node_modules\/@plasius\/gpu-shared\/dist/);
  assert.match(demoHtml, /<script type="importmap">/);
  assert.match(
    demoHtml,
    /"@plasius\/gpu-shared"\s*:\s*"\.\.\/node_modules\/@plasius\/gpu-shared\/dist\/index\.js"/,
  );
});

test("README documents the live 3D particle demo", () => {
  const readme = fs.readFileSync(path.resolve(projectRoot, "README.md"), "utf8");

  assert.match(readme, /mounts the shared `@plasius\/gpu-shared` 3D harbor surface/i);
  assert.match(readme, /rotates\s+through particle effects in world space/i);
  assert.match(readme, /stable\s+snapshot policy, root jobs, and render stages stay visible in context/i);
  assert.doesNotMatch(readme, /The demo uses 2D canvas previews/i);
});

test("fetcher branch rejects HTML payloads", async () => {
  const module = await importParticleModuleWithBase(
    new URL("https://particles.example/pkg/index.js"),
    "fetch-html"
  );

  await assert.rejects(
    () =>
      module.loadParticleEffectPreludeWgsl("fire", {
        fetcher: async () => ({
          ok: true,
          async text() {
            return "<!doctype html><html><body>not wgsl</body></html>";
          },
        }),
      }),
    /Expected WGSL/
  );
});
