const baseUrl = (() => {
  if (typeof __IMPORT_META_URL__ !== "undefined") {
    return new URL("./index.js", __IMPORT_META_URL__);
  }
  if (typeof __filename !== "undefined" && typeof require !== "undefined") {
    const { pathToFileURL } = require("node:url");
    return pathToFileURL(__filename);
  }
  const base =
    typeof process !== "undefined" && process.cwd
      ? `file://${process.cwd()}/`
      : "file:///";
  return new URL("./index.js", base);
})();

const effectSpecs = {
  fire: {
    prelude: "prelude.wgsl",
    jobs: {
      physics: "physics.job.wgsl",
      render: "render.job.wgsl",
    },
  },
  sparks: {
    prelude: "prelude.wgsl",
    jobs: {
      update: "update.job.wgsl",
      render: "render.job.wgsl",
    },
  },
  text: {
    prelude: "prelude.wgsl",
    jobs: {
      layout: "layout.job.wgsl",
      render: "render.job.wgsl",
    },
  },
  rain: {
    prelude: "prelude.wgsl",
    jobs: {
      update: "update.job.wgsl",
      render: "render.job.wgsl",
    },
  },
  snow: {
    prelude: "prelude.wgsl",
    jobs: {
      update: "update.job.wgsl",
      render: "render.job.wgsl",
    },
  },
  firework: {
    prelude: "prelude.wgsl",
    jobs: {
      update: "update.job.wgsl",
      render: "render.job.wgsl",
    },
  },
};

function buildEffect(name, spec) {
  const preludeUrl = new URL(`./effects/${name}/${spec.prelude}`, baseUrl);
  const jobs = Object.entries(spec.jobs).map(([key, file]) => {
    const label = `particles.${name}.${key}`;
    return {
      key,
      label,
      url: new URL(`./effects/${name}/${file}`, baseUrl),
      sourceName: label,
    };
  });
  return {
    name,
    preludeUrl,
    jobs,
  };
}

export const particleEffects = Object.freeze(
  Object.fromEntries(
    Object.entries(effectSpecs).map(([name, spec]) => [
      name,
      buildEffect(name, spec),
    ])
  )
);

export const particleEffectNames = Object.freeze(
  Object.keys(particleEffects)
);

export const defaultParticleEffect = "fire";

function getEffectJob(effect, key) {
  const job = effect.jobs.find((entry) => entry.key === key);
  if (!job) {
    const available = effect.jobs.map((entry) => entry.key).join(", ");
    throw new Error(
      `Unknown job "${key}" for effect "${effect.name}". ` +
        `Available: ${available}.`
    );
  }
  return job;
}

export function getParticleEffect(name = defaultParticleEffect) {
  const effect = particleEffects[name];
  if (!effect) {
    const available = particleEffectNames.join(", ");
    throw new Error(`Unknown particle effect "${name}". Available: ${available}.`);
  }
  return effect;
}

const defaultEffect = getParticleEffect(defaultParticleEffect);
const defaultPhysicsJob = getEffectJob(defaultEffect, "physics");
const defaultRenderJob = getEffectJob(defaultEffect, "render");

export const particlePreludeWgslUrl = defaultEffect.preludeUrl;
export const particlePhysicsJobWgslUrl = defaultPhysicsJob.url;
export const particleRenderJobWgslUrl = defaultRenderJob.url;

export const particleJobLabels = {
  physics: defaultPhysicsJob.label,
  render: defaultRenderJob.label,
};

export const particleJobs = [
  {
    label: defaultPhysicsJob.label,
    url: defaultPhysicsJob.url,
    sourceName: defaultPhysicsJob.sourceName,
  },
  {
    label: defaultRenderJob.label,
    url: defaultRenderJob.url,
    sourceName: defaultRenderJob.sourceName,
  },
];

function assertNotHtmlWgsl(source, context) {
  const sample = source.slice(0, 200).toLowerCase();
  if (
    sample.includes("<!doctype") ||
    sample.includes("<html") ||
    sample.includes("<meta")
  ) {
    const label = context ? ` for ${context}` : "";
    throw new Error(
      `Expected WGSL${label} but received HTML. Check the URL or server root.`
    );
  }
}

async function loadWgslSource(options = {}) {
  const { wgsl, url, fetcher = globalThis.fetch, base } = options ?? {};
  if (typeof wgsl === "string") {
    assertNotHtmlWgsl(wgsl, "inline WGSL");
    return wgsl;
  }
  if (!url) {
    return null;
  }
  const resolved = url instanceof URL ? url : new URL(url, base ?? baseUrl);
  if (!fetcher || resolved.protocol === "file:") {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const source = await readFile(fileURLToPath(resolved), "utf8");
    assertNotHtmlWgsl(source, resolved.href);
    return source;
  }
  const response = await fetcher(resolved);
  if (!response.ok) {
    const status = "status" in response ? response.status : "unknown";
    const statusText = "statusText" in response ? response.statusText : "";
    const detail = statusText ? `${status} ${statusText}` : `${status}`;
    throw new Error(`Failed to load WGSL (${detail})`);
  }
  const source = await response.text();
  assertNotHtmlWgsl(source, resolved.href);
  return source;
}

async function loadEffectPrelude(effect, fetcher) {
  const source = await loadWgslSource({ url: effect.preludeUrl, fetcher });
  if (typeof source !== "string") {
    throw new Error(`Failed to load ${effect.name} prelude WGSL source.`);
  }
  return source;
}

async function loadEffectJob(effect, job, fetcher) {
  const source = await loadWgslSource({ url: job.url, fetcher });
  if (typeof source !== "string") {
    throw new Error(
      `Failed to load ${effect.name} job "${job.key}" WGSL source.`
    );
  }
  return source;
}

export async function loadParticleEffectPreludeWgsl(effectName, options = {}) {
  const { fetcher } = options ?? {};
  const effect = getParticleEffect(effectName);
  return loadEffectPrelude(effect, fetcher);
}

export async function loadParticleEffectJobWgsl(
  effectName,
  jobKey,
  options = {}
) {
  const { fetcher } = options ?? {};
  const effect = getParticleEffect(effectName);
  const job = getEffectJob(effect, jobKey);
  return loadEffectJob(effect, job, fetcher);
}

export async function loadParticleEffectJobs(effectName, options = {}) {
  const { fetcher } = options ?? {};
  const effect = getParticleEffect(effectName);
  const preludeWgsl = await loadEffectPrelude(effect, fetcher);
  const jobSources = await Promise.all(
    effect.jobs.map((job) => loadEffectJob(effect, job, fetcher))
  );
  const jobs = effect.jobs.map((job, index) => ({
    wgsl: jobSources[index],
    label: job.label,
    sourceName: job.sourceName,
  }));
  return { preludeWgsl, jobs };
}

export async function loadParticlePreludeWgsl(options = {}) {
  const { fetcher } = options ?? {};
  return loadEffectPrelude(defaultEffect, fetcher);
}

export async function loadParticlePhysicsJobWgsl(options = {}) {
  const { fetcher } = options ?? {};
  return loadEffectJob(defaultEffect, defaultPhysicsJob, fetcher);
}

export async function loadParticleRenderJobWgsl(options = {}) {
  const { fetcher } = options ?? {};
  return loadEffectJob(defaultEffect, defaultRenderJob, fetcher);
}

export async function loadParticleJobs(options = {}) {
  return loadParticleEffectJobs(defaultParticleEffect, options);
}
