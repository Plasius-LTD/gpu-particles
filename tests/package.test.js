import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const originalImportMetaUrl = globalThis.__IMPORT_META_URL__;
globalThis.__IMPORT_META_URL__ = new URL("../src/index.js", import.meta.url);
const {
  defaultParticleEffect,
  particleEffectNames,
  particleEffects,
  particlePreludeWgslUrl,
  particlePhysicsJobWgslUrl,
  particleRenderJobWgslUrl,
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
