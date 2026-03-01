import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const originalImportMetaUrl = globalThis.__IMPORT_META_URL__;
globalThis.__IMPORT_META_URL__ = new URL("../src/index.js", import.meta.url);
const {
  defaultParticleEffect,
  getParticleEffect,
  particleEffectNames,
  particleEffects,
  particleJobLabels,
  particleJobs,
  particlePreludeWgslUrl,
  particlePhysicsJobWgslUrl,
  particleRenderJobWgslUrl,
  loadParticleEffectJobWgsl,
  loadParticleEffectJobs,
  loadParticleEffectPreludeWgsl,
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
