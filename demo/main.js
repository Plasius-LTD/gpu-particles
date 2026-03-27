import {
  createParticleSecondarySimulationPlan,
  getParticleEffectWorkerManifest,
  particleEffectNames,
} from "../dist/index.js";
import { mountGpuShowcase } from "@plasius/gpu-shared";

const root = globalThis.document?.getElementById("app");
if (!root) {
  throw new Error("Particles demo root element was not found.");
}

const effectVisuals = {
  fire: {
    flagColor: { r: 0.86, g: 0.3, b: 0.16 },
    reflectionStrength: 0.2,
    waveAmplitude: 0.7,
    lanternGlow: { r: 1, g: 0.54, b: 0.22 },
  },
  sparks: {
    flagColor: { r: 0.82, g: 0.46, b: 0.22 },
    reflectionStrength: 0.18,
    waveAmplitude: 0.68,
    lanternGlow: { r: 0.98, g: 0.62, b: 0.26 },
  },
  text: {
    flagColor: { r: 0.74, g: 0.24, b: 0.2 },
    reflectionStrength: 0.12,
    waveAmplitude: 0.58,
    moonHalo: "rgba(156, 182, 244, 0.18)",
  },
  rain: {
    flagColor: { r: 0.46, g: 0.58, b: 0.8 },
    reflectionStrength: 0.14,
    waveAmplitude: 0.82,
    ambientMist: "rgba(60, 86, 128, 0.2)",
  },
  snow: {
    flagColor: { r: 0.88, g: 0.9, b: 0.96 },
    reflectionStrength: 0.16,
    waveAmplitude: 0.54,
    moonHalo: "rgba(206, 224, 255, 0.22)",
  },
  firework: {
    flagColor: { r: 0.84, g: 0.28, b: 0.62 },
    reflectionStrength: 0.24,
    waveAmplitude: 0.72,
    lanternGlow: { r: 0.9, g: 0.38, b: 0.66 },
  },
};

function createState() {
  return {
    effectName: particleEffectNames[0],
  };
}

function updateState(state, scene) {
  const cycle = scene.stress ? particleEffectNames.length - 1 : Math.floor(scene.time / 5) % particleEffectNames.length;
  state.effectName = particleEffectNames[cycle];
  return state;
}

function describeState(state, scene) {
  const manifest = getParticleEffectWorkerManifest(state.effectName);
  const secondarySimulation = createParticleSecondarySimulationPlan(state.effectName);
  const rootJobs = secondarySimulation.rootJobIds.join(", ");
  const visuals = effectVisuals[state.effectName] ?? effectVisuals.fire;

  return {
    status: `Particles live · ${state.effectName} effect`,
    details:
      "gpu-particles now validates its worker manifests and secondary simulation policy against a mounted 3D scene instead of six separate 2D preview canvases.",
    sceneMetrics: [
      `effect: ${state.effectName}`,
      `worker jobs: ${manifest.jobs.length}`,
      `root jobs: ${rootJobs}`,
      `snapshot policy: ${secondarySimulation.snapshotPolicy.mode}`,
    ],
    qualityMetrics: [
      `queue class: ${manifest.jobs[0]?.worker.queueClass ?? "-"}`,
      `authoritative source: ${secondarySimulation.snapshotPolicy.sourceOwner ?? "none"}`,
      `source stage: ${secondarySimulation.snapshotPolicy.sourceStage ?? "standalone"}`,
      `allocation hints: ${manifest.suggestedAllocationIds.length}`,
    ],
    debugMetrics: [
      `scene stress: ${scene.stress ? "on" : "off"}`,
      `spray count: ${scene.sprays.length}`,
      `collisions: ${scene.collisions}`,
      `render stages: ${secondarySimulation.stages.length}`,
    ],
    notes: [
      "The visual surface is shared, but the particle package still drives effect selection, worker manifests, and stable-snapshot policy.",
      "Stress mode snaps to the firework profile so the heaviest effect path is easy to inspect.",
      "This keeps the demo 3D while staying grounded in gpu-particles contracts instead of a package-local renderer.",
    ],
    textState: {
      effectName: state.effectName,
      rootJobIds: secondarySimulation.rootJobIds,
      snapshotPolicy: secondarySimulation.snapshotPolicy,
    },
    visuals: {
      ...visuals,
      shadowAccent: scene.stress ? 0.09 : 0.05,
      flagMotion: state.effectName === "snow" ? 0.42 : 0.56,
    },
  };
}

await mountGpuShowcase({
  root,
  focus: "integrated",
  packageName: "@plasius/gpu-particles",
  title: "Particle Worker Harbor Validation",
  subtitle:
    "A moonlit shared harbor scene driven by gpu-particles effect manifests, stable-snapshot policy, and queue metadata.",
  createState,
  updateState,
  describeState,
});
