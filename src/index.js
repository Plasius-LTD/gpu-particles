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
export const particleSecondarySimulationModes = Object.freeze({
  stableWorldSnapshot: "stable-world-snapshot",
  standaloneVisual: "standalone-visual",
});

export const particleDebugOwner = "particles";
export const particleWorkerQueueClasses = Object.freeze({
  simulation: "simulation",
  render: "render",
});

function buildWorkerBudgetLevels(jobType, queueClass, presets) {
  return Object.freeze([
    Object.freeze({
      id: "low",
      estimatedCostMs: presets.low.estimatedCostMs,
      config: Object.freeze({
        maxDispatchesPerFrame: presets.low.maxDispatchesPerFrame,
        maxJobsPerDispatch: presets.low.maxJobsPerDispatch,
        cadenceDivisor: presets.low.cadenceDivisor,
        workgroupScale: presets.low.workgroupScale,
        maxQueueDepth: presets.low.maxQueueDepth,
        metadata: Object.freeze({
          owner: particleDebugOwner,
          queueClass,
          jobType,
          quality: "low",
        }),
      }),
    }),
    Object.freeze({
      id: "medium",
      estimatedCostMs: presets.medium.estimatedCostMs,
      config: Object.freeze({
        maxDispatchesPerFrame: presets.medium.maxDispatchesPerFrame,
        maxJobsPerDispatch: presets.medium.maxJobsPerDispatch,
        cadenceDivisor: presets.medium.cadenceDivisor,
        workgroupScale: presets.medium.workgroupScale,
        maxQueueDepth: presets.medium.maxQueueDepth,
        metadata: Object.freeze({
          owner: particleDebugOwner,
          queueClass,
          jobType,
          quality: "medium",
        }),
      }),
    }),
    Object.freeze({
      id: "high",
      estimatedCostMs: presets.high.estimatedCostMs,
      config: Object.freeze({
        maxDispatchesPerFrame: presets.high.maxDispatchesPerFrame,
        maxJobsPerDispatch: presets.high.maxJobsPerDispatch,
        cadenceDivisor: presets.high.cadenceDivisor,
        workgroupScale: presets.high.workgroupScale,
        maxQueueDepth: presets.high.maxQueueDepth,
        metadata: Object.freeze({
          owner: particleDebugOwner,
          queueClass,
          jobType,
          quality: "high",
        }),
      }),
    }),
  ]);
}

const particleWorkerSpecPresets = {
  fire: {
    suggestedAllocationIds: [
      "particles.fire.state",
      "particles.fire.indirect",
      "particles.fire.render-state",
    ],
    jobs: {
      physics: {
        queueClass: particleWorkerQueueClasses.simulation,
        authority: "non-authoritative-simulation",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "particles.fire.physics",
          particleWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.5,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 256,
            },
            medium: {
              estimatedCostMs: 1,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 512,
            },
            high: {
              estimatedCostMs: 1.6,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 512,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 768,
            },
          }
        ),
        suggestedAllocationIds: ["particles.fire.state"],
      },
      render: {
        queueClass: particleWorkerQueueClasses.render,
        authority: "visual",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "particles.fire.render",
          particleWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 256,
            },
            medium: {
              estimatedCostMs: 0.7,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 512,
            },
            high: {
              estimatedCostMs: 1.1,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 512,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 768,
            },
          }
        ),
        suggestedAllocationIds: [
          "particles.fire.render-state",
          "particles.fire.indirect",
        ],
      },
    },
  },
  sparks: {
    suggestedAllocationIds: ["particles.sparks.state", "particles.sparks.indirect"],
    jobs: {
      update: {
        queueClass: particleWorkerQueueClasses.simulation,
        authority: "non-authoritative-simulation",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.sparks.update",
          particleWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 64,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 128,
            },
            medium: {
              estimatedCostMs: 0.5,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 256,
            },
            high: {
              estimatedCostMs: 0.8,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
          }
        ),
        suggestedAllocationIds: ["particles.sparks.state"],
      },
      render: {
        queueClass: particleWorkerQueueClasses.render,
        authority: "visual",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.sparks.render",
          particleWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 64,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 128,
            },
            medium: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 256,
            },
            high: {
              estimatedCostMs: 0.7,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
          }
        ),
        suggestedAllocationIds: ["particles.sparks.indirect"],
      },
    },
  },
  text: {
    suggestedAllocationIds: ["particles.text.layout", "particles.text.indirect"],
    jobs: {
      layout: {
        queueClass: particleWorkerQueueClasses.render,
        authority: "visual",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.text.layout",
          particleWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 32,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 64,
            },
            medium: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 64,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 128,
            },
            high: {
              estimatedCostMs: 0.6,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
          }
        ),
        suggestedAllocationIds: ["particles.text.layout"],
      },
      render: {
        queueClass: particleWorkerQueueClasses.render,
        authority: "visual",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.text.render",
          particleWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 32,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 64,
            },
            medium: {
              estimatedCostMs: 0.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 64,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 128,
            },
            high: {
              estimatedCostMs: 0.5,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
          }
        ),
        suggestedAllocationIds: ["particles.text.indirect"],
      },
    },
  },
  rain: {
    suggestedAllocationIds: ["particles.rain.state", "particles.rain.indirect"],
    jobs: {
      update: {
        queueClass: particleWorkerQueueClasses.simulation,
        authority: "non-authoritative-simulation",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.rain.update",
          particleWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.8,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 1.1,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["particles.rain.state"],
      },
      render: {
        queueClass: particleWorkerQueueClasses.render,
        authority: "visual",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.rain.render",
          particleWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 0.7,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["particles.rain.indirect"],
      },
    },
  },
  snow: {
    suggestedAllocationIds: ["particles.snow.state", "particles.snow.indirect"],
    jobs: {
      update: {
        queueClass: particleWorkerQueueClasses.simulation,
        authority: "non-authoritative-simulation",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.snow.update",
          particleWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.6,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 0.9,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["particles.snow.state"],
      },
      render: {
        queueClass: particleWorkerQueueClasses.render,
        authority: "visual",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "particles.snow.render",
          particleWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 0.6,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["particles.snow.indirect"],
      },
    },
  },
  firework: {
    suggestedAllocationIds: [
      "particles.firework.state",
      "particles.firework.smoke",
      "particles.firework.indirect",
    ],
    jobs: {
      update: {
        queueClass: particleWorkerQueueClasses.simulation,
        authority: "non-authoritative-simulation",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "particles.firework.update",
          particleWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.6,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 1.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 1.9,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["particles.firework.state", "particles.firework.smoke"],
      },
      render: {
        queueClass: particleWorkerQueueClasses.render,
        authority: "visual",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "particles.firework.render",
          particleWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.6,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 1,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["particles.firework.indirect"],
      },
    },
  },
};

const particleSecondarySimulationPolicySpecs = Object.freeze({
  fire: Object.freeze({
    mode: particleSecondarySimulationModes.stableWorldSnapshot,
    required: true,
    sourceOwner: "physics",
    sourceStage: "worldSnapshot",
    stability: "post-authoritative-commit",
    frameBinding: "same-frame",
    reason: "Fire effects react to resolved world motion and contact state.",
  }),
  sparks: Object.freeze({
    mode: particleSecondarySimulationModes.stableWorldSnapshot,
    required: true,
    sourceOwner: "physics",
    sourceStage: "worldSnapshot",
    stability: "post-authoritative-commit",
    frameBinding: "same-frame",
    reason: "Sparks should reflect resolved impact and collision outcomes.",
  }),
  text: Object.freeze({
    mode: particleSecondarySimulationModes.standaloneVisual,
    required: false,
    stability: "local-visual-state",
    frameBinding: "self-authored",
    reason: "Text particles are layout-driven and do not depend on world physics.",
  }),
  rain: Object.freeze({
    mode: particleSecondarySimulationModes.stableWorldSnapshot,
    required: true,
    sourceOwner: "physics",
    sourceStage: "worldSnapshot",
    stability: "post-authoritative-commit",
    frameBinding: "same-frame",
    reason: "Rain splash and collision response should read resolved world state.",
  }),
  snow: Object.freeze({
    mode: particleSecondarySimulationModes.stableWorldSnapshot,
    required: true,
    sourceOwner: "physics",
    sourceStage: "worldSnapshot",
    stability: "post-authoritative-commit",
    frameBinding: "same-frame",
    reason: "Snow drift and settling should consume stable world state.",
  }),
  firework: Object.freeze({
    mode: particleSecondarySimulationModes.stableWorldSnapshot,
    required: true,
    sourceOwner: "physics",
    sourceStage: "worldSnapshot",
    stability: "post-authoritative-commit",
    frameBinding: "same-frame",
    reason: "Firework debris and smoke should react to resolved world motion.",
  }),
});

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

function buildWorkerManifestJob(effectName, job) {
  const spec = particleWorkerSpecPresets[effectName].jobs[job.key];
  const dependencies =
    job.key === "render"
      ? Object.freeze(
          getParticleEffect(effectName).jobs
            .filter((entry) => entry.key !== "render")
            .map((entry) => `particles.${effectName}.${entry.key}`)
        )
      : Object.freeze([]);
  const priority = job.key === "render" ? 2 : 3;

  return Object.freeze({
    key: job.key,
    label: job.label,
    worker: Object.freeze({
      jobType: job.label,
      queueClass: spec.queueClass,
      priority,
      dependencies,
      schedulerMode: "dag",
    }),
    performance: Object.freeze({
      id: job.label,
      jobType: job.label,
      queueClass: spec.queueClass,
      domain: "particles",
      authority: spec.authority,
      importance: spec.importance,
      levels: spec.levels,
    }),
    debug: Object.freeze({
      owner: particleDebugOwner,
      queueClass: spec.queueClass,
      jobType: job.label,
      tags: Object.freeze(["particles", effectName, job.key]),
      suggestedAllocationIds: Object.freeze([...spec.suggestedAllocationIds]),
    }),
  });
}

function buildParticleWorkerManifest(name, effect) {
  const spec = particleWorkerSpecPresets[name];
  const policy = particleSecondarySimulationPolicySpecs[name];

  return Object.freeze({
    schemaVersion: 1,
    owner: particleDebugOwner,
    effect: name,
    schedulerMode: "dag",
    secondarySimulation: Object.freeze({
      mode: policy.mode,
      required: policy.required,
      sourceOwner: policy.sourceOwner,
      sourceStage: policy.sourceStage,
      stability: policy.stability,
      frameBinding: policy.frameBinding,
      reason: policy.reason,
    }),
    suggestedAllocationIds: Object.freeze([...spec.suggestedAllocationIds]),
    jobs: Object.freeze(effect.jobs.map((job) => buildWorkerManifestJob(name, job))),
  });
}

export const particleWorkerManifests = Object.freeze(
  Object.fromEntries(
    Object.entries(particleEffects).map(([name, effect]) => [
      name,
      buildParticleWorkerManifest(name, effect),
    ])
  )
);

export function getParticleEffectWorkerManifest(
  name = defaultParticleEffect
) {
  const manifest = particleWorkerManifests[name];
  if (!manifest) {
    const available = particleEffectNames.join(", ");
    throw new Error(`Unknown particle effect "${name}". Available: ${available}.`);
  }
  return manifest;
}

function resolveParticleStageRole(job) {
  if (job.worker.queueClass === particleWorkerQueueClasses.simulation) {
    return "secondary-simulation";
  }

  if (job.key === "render") {
    return "render-submit";
  }

  return "visual-layout";
}

export function createParticleSecondarySimulationPlan(
  effectName = defaultParticleEffect
) {
  const manifest = getParticleEffectWorkerManifest(effectName);

  return Object.freeze({
    effect: effectName,
    schedulerMode: manifest.schedulerMode,
    snapshotPolicy: Object.freeze({ ...manifest.secondarySimulation }),
    rootJobIds: Object.freeze(
      manifest.jobs
        .filter((job) => job.worker.dependencies.length === 0)
        .map((job) => job.performance.id)
    ),
    stages: Object.freeze(
      manifest.jobs.map((job) =>
        Object.freeze({
          id: job.performance.id,
          key: job.key,
          role: resolveParticleStageRole(job),
          queueClass: job.worker.queueClass,
          authority: job.performance.authority,
          priority: job.worker.priority,
          dependencies: Object.freeze([...job.worker.dependencies]),
        })
      )
    ),
    degradationOrder: Object.freeze([
      "updateCadence",
      "workgroupScale",
      "maxJobsPerDispatch",
      "maxDispatchesPerFrame",
    ]),
  });
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

export async function loadParticleEffectWorkerBundle(
  effectName = defaultParticleEffect,
  options = {}
) {
  const effect = getParticleEffect(effectName);
  const { preludeWgsl, jobs } = await loadParticleEffectJobs(effect.name, options);

  return {
    effect: effect.name,
    preludeWgsl,
    jobs,
    workerManifest: getParticleEffectWorkerManifest(effect.name),
    secondarySimulationPlan: createParticleSecondarySimulationPlan(effect.name),
  };
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
