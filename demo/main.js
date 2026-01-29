const statusEl = document.getElementById("status");

function setStatus(message, tone = "info") {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function nextPowerOfTwo(value) {
  let v = 1;
  while (v < value) {
    v <<= 1;
  }
  return v;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toCanvasPos(x, y, width, height) {
  return [x * width, (1 - y) * height];
}

function renderFire(ctx, data, count, width, height, scene, time) {
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#1a0c08");
  gradient.addColorStop(1, "#05060b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const torchX = width * scene.torch.x;
  const torchY = height * (1 - scene.torch.y);
  ctx.fillStyle = "#5c3b1e";
  ctx.fillRect(torchX - 6, torchY, 12, height - torchY - 8);
  ctx.fillStyle = "#3a2512";
  ctx.fillRect(torchX - 10, torchY + 12, 20, 8);

  // Smoke pass
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const life = data[base + 2];
    const kind = data[base + 6];
    const size = data[base + 7] || 1;
    if (life <= 0 || kind < 0.5) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    const alpha = clamp(life / 2.5, 0, 1) * 0.45;
    const radius = 6 + size * 4;
    ctx.fillStyle = `rgba(120, 120, 120, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flame pass
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const life = data[base + 2];
    const kind = data[base + 6];
    const size = data[base + 7] || 1;
    if (life <= 0) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    if (kind > 0.5) {
      continue;
    }
    const alpha = clamp(life / 1.1, 0, 1);
    const flicker = 0.5 + 0.5 * Math.abs(Math.sin(time * 3 + i));
    const heat = Math.floor(120 + 100 * flicker);
    ctx.fillStyle = `rgba(255, ${heat}, 60, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 4 + size * 1.5 + flicker, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

function renderSparks(ctx, data, count, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0a0d17";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 200, 140, 0.8)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const vx = data[base + 4];
    const vy = data[base + 5];
    const life = data[base + 2];
    if (life <= 0) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    const tailX = cx - vx * 18;
    const tailY = cy + vy * 18;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }
}

function renderRain(ctx, data, count, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b111c";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(120, 170, 255, 0.65)";
  ctx.lineWidth = 1;

  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const vy = data[base + 5];
    const life = data[base + 2];
    if (life <= 0) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    const length = clamp(Math.abs(vy) * 18, 8, 24);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + length);
    ctx.stroke();
  }
}

function renderSnow(ctx, data, count, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#07111a";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(230, 240, 255, 0.8)";

  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const life = data[base + 2];
    if (life <= 0) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderFirework(ctx, data, count, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#05060b";
  ctx.fillRect(0, 0, width, height);

  const palette = [
    [255, 196, 120],
    [120, 220, 255],
    [255, 120, 210],
    [255, 240, 150],
  ];

  // Smoke layer
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const life = data[base + 2];
    const kind = data[base + 6];
    const colorIndex = Math.floor(data[base + 7]);
    if (life <= 0 || kind < 0.9 || kind > 1.1) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    const alpha = clamp(life / 3.2, 0, 1) * 0.25;
    const tint = palette[colorIndex % palette.length];
    const tintBlend = 0.15;
    const r = Math.floor(120 * (1 - tintBlend) + tint[0] * tintBlend);
    const g = Math.floor(120 * (1 - tintBlend) + tint[1] * tintBlend);
    const b = Math.floor(140 * (1 - tintBlend) + tint[2] * tintBlend);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ash layer
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(90, 85, 80, 0.55)";
  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const life = data[base + 2];
    const kind = data[base + 6];
    const colorIndex = Math.floor(data[base + 7]);
    if (life <= 0 || kind < 1.9) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    const tint = palette[colorIndex % palette.length];
    const alpha = clamp(life / 2.2, 0, 1) * 0.55;
    ctx.fillStyle = `rgba(${Math.floor(tint[0] * 0.5)}, ${Math.floor(
      tint[1] * 0.45
    )}, ${Math.floor(tint[2] * 0.4)}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparks layer
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const life = data[base + 2];
    const kind = data[base + 6];
    const colorIndex = Math.floor(data[base + 7]);
    if (life <= 0 || kind > 0.5) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    const tint = palette[colorIndex % palette.length];
    const alpha = clamp(life / 1.4, 0, 1) * 0.9 + 0.1;
    ctx.fillStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

function renderText(ctx, data, count, width, height, scene) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b0d12";
  ctx.fillRect(0, 0, width, height);

  const box = scene.box;
  const boxX = box.x * width;
  const boxY = (1 - box.y - box.h) * height;
  const boxW = box.w * width;
  const boxH = box.h * height;
  ctx.strokeStyle = "rgba(120, 160, 220, 0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.font = "14px 'Space Mono', monospace";
  ctx.fillStyle = "rgba(200, 220, 255, 0.9)";
  for (let i = 0; i < count; i += 1) {
    const base = i * 8;
    const x = data[base];
    const y = data[base + 1];
    const value = data[base + 7];
    const life = data[base + 2];
    if (life <= 0) {
      continue;
    }
    const [cx, cy] = toCanvasPos(x, y, width, height);
    const text = String(Math.floor(value) % 10000).padStart(4, "0");
    ctx.fillText(text, cx - 10, cy);
  }
}

function createQueueBuffers(device, maxJobs, maxPayloadWords) {
  const capacity = nextPowerOfTwo(maxJobs);
  const queueHeaderSize = 16;
  const slotStride = 16;
  const slotsSize = capacity * slotStride;
  const payloadSize = maxJobs * maxPayloadWords * 4;

  const queueBuffer = device.createBuffer({
    size: queueHeaderSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const slotsBuffer = device.createBuffer({
    size: slotsSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const inputJobsBuffer = device.createBuffer({
    size: maxJobs * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const outputJobsBuffer = device.createBuffer({
    size: maxJobs * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const inputPayloadBuffer = device.createBuffer({
    size: payloadSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const outputPayloadBuffer = device.createBuffer({
    size: payloadSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const statusBuffer = device.createBuffer({
    size: maxJobs * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const paramsBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const queueHeader = new Uint32Array([0, 0, capacity, capacity - 1]);
  const slotsInit = new Uint32Array(slotsSize / 4);
  for (let i = 0; i < capacity; i += 1) {
    slotsInit[i * 4] = i;
  }
  const statusZero = new Uint32Array(maxJobs);

  return {
    capacity,
    queueBuffer,
    slotsBuffer,
    inputJobsBuffer,
    outputJobsBuffer,
    inputPayloadBuffer,
    outputPayloadBuffer,
    statusBuffer,
    paramsBuffer,
    queueHeader,
    slotsInit,
    statusZero,
  };
}

async function createScene(options) {
  const {
    device,
    queueLayout,
    effectLayout,
    assembleWorkerWgsl,
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
    queueWgsl,
    workerWgsl,
    canvas,
    effectName,
    jobKey,
    maxCount,
    spawnRadius,
    origin,
    drift,
    intensityEl,
    intensityValueEl,
    intensityAffectsCount = true,
    render,
    extra,
  } = options;

  const ctx = canvas.getContext("2d");
  const preludeWgsl = await loadParticleEffectPreludeWgsl(effectName, {
    fetcher: fetch,
  });
  const jobWgsl = await loadParticleEffectJobWgsl(effectName, jobKey, {
    fetcher: fetch,
  });

  const shaderCode = await assembleWorkerWgsl(workerWgsl, {
    queueWgsl,
    preludeWgsl,
    jobs: [{ wgsl: jobWgsl, label: `${effectName}.${jobKey}` }],
  });
  const module = device.createShaderModule({ code: shaderCode });

  const enqueuePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [queueLayout] }),
    compute: { module, entryPoint: "enqueue_main" },
  });
  const workerPipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [queueLayout, effectLayout],
    }),
    compute: { module, entryPoint: "worker_main" },
  });

  const maxPayloadWords = 1;
  const queueBuffers = createQueueBuffers(device, maxCount, maxPayloadWords);

  const particleStride = 8;
  const particleBufferSize = maxCount * particleStride * 4;
  const particlesBuffer = device.createBuffer({
    size: particleBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });
  const readbackBuffer = device.createBuffer({
    size: particleBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  const paramsBuffer = device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const queueBindGroup = device.createBindGroup({
    layout: queueLayout,
    entries: [
      { binding: 0, resource: { buffer: queueBuffers.queueBuffer } },
      { binding: 1, resource: { buffer: queueBuffers.slotsBuffer } },
      { binding: 2, resource: { buffer: queueBuffers.inputJobsBuffer } },
      { binding: 3, resource: { buffer: queueBuffers.outputJobsBuffer } },
      { binding: 4, resource: { buffer: queueBuffers.inputPayloadBuffer } },
      { binding: 5, resource: { buffer: queueBuffers.outputPayloadBuffer } },
      { binding: 6, resource: { buffer: queueBuffers.statusBuffer } },
      { binding: 7, resource: { buffer: queueBuffers.paramsBuffer } },
    ],
  });

  const effectBindGroup = device.createBindGroup({
    layout: effectLayout,
    entries: [
      { binding: 0, resource: { buffer: particlesBuffer } },
      { binding: 1, resource: { buffer: paramsBuffer } },
    ],
  });

  const particles = new Float32Array(maxCount * particleStride);
  for (let i = 0; i < maxCount; i += 1) {
    const base = i * particleStride;
    particles[base] = origin[0];
    particles[base + 1] = origin[1];
    particles[base + 2] = -1;
    particles[base + 3] = Math.random() * 1e6;
    particles[base + 4] = 0;
    particles[base + 5] = 0;
    particles[base + 6] = 0;
    particles[base + 7] = Math.floor(Math.random() * 10000);
  }
  device.queue.writeBuffer(particlesBuffer, 0, particles);

  const inputJobs = new Uint32Array(maxCount * 4);
  const inputPayloads = new Uint32Array(maxCount * maxPayloadWords);
  for (let i = 0; i < maxCount; i += 1) {
    const base = i * 4;
    inputJobs[base] = 0;
    inputJobs[base + 1] = i;
    inputJobs[base + 2] = 1;
    inputJobs[base + 3] = 0;
    inputPayloads[i] = i;
  }
  device.queue.writeBuffer(queueBuffers.inputJobsBuffer, 0, inputJobs);
  device.queue.writeBuffer(queueBuffers.inputPayloadBuffer, 0, inputPayloads);

  const paramsData = new Uint32Array(4);

  const effectParams = new Float32Array(12);
  const boundsMin = [0, 0];
  const boundsMax = [1, 1];

  const scene = {
    canvas,
    ctx,
    enqueuePipeline,
    workerPipeline,
    queueBindGroup,
    effectBindGroup,
    queueBuffers,
    particlesBuffer,
    readbackBuffer,
    paramsBuffer,
    effectParams,
    paramsData,
    boundsMin,
    boundsMax,
    particleStride,
    maxCount,
    activeCount: maxCount,
    intensity: 1,
    origin,
    spawnRadius,
    drift,
    render,
    extra,
  };

  const updateIntensityLabel = (value) => {
    if (!intensityValueEl) {
      return;
    }
    intensityValueEl.textContent = `${Math.round(value * 100)}%`;
  };

  if (intensityEl) {
    scene.intensity = Number(intensityEl.value);
    scene.activeCount = intensityAffectsCount
      ? Math.max(1, Math.floor(maxCount * scene.intensity))
      : maxCount;
    updateIntensityLabel(scene.intensity);
    intensityEl.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      scene.intensity = value;
      scene.activeCount = intensityAffectsCount
        ? Math.max(1, Math.floor(maxCount * scene.intensity))
        : maxCount;
      updateIntensityLabel(scene.intensity);
    });
  }

  scene.step = async (time, dt) => {
    const jobCount = scene.activeCount;
    if (jobCount <= 0) {
      return;
    }

    scene.effectParams[0] = time;
    scene.effectParams[1] = dt;
    scene.effectParams[2] = scene.intensity;
    scene.effectParams[3] = scene.spawnRadius;
    scene.effectParams[4] = scene.boundsMin[0];
    scene.effectParams[5] = scene.boundsMin[1];
    scene.effectParams[6] = scene.boundsMax[0];
    scene.effectParams[7] = scene.boundsMax[1];
    scene.effectParams[8] = scene.origin[0];
    scene.effectParams[9] = scene.origin[1];
    scene.effectParams[10] = scene.drift[0];
    scene.effectParams[11] = scene.drift[1];

    device.queue.writeBuffer(scene.paramsBuffer, 0, scene.effectParams);

    scene.paramsData[0] = jobCount;
    scene.paramsData[1] = 1;
    device.queue.writeBuffer(scene.queueBuffers.paramsBuffer, 0, scene.paramsData);

    device.queue.writeBuffer(scene.queueBuffers.queueBuffer, 0, scene.queueBuffers.queueHeader);
    device.queue.writeBuffer(scene.queueBuffers.slotsBuffer, 0, scene.queueBuffers.slotsInit);
    device.queue.writeBuffer(scene.queueBuffers.statusBuffer, 0, scene.queueBuffers.statusZero);

    const workgroups = Math.max(1, Math.ceil(jobCount / 64));

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(scene.enqueuePipeline);
    pass.setBindGroup(0, scene.queueBindGroup);
    pass.dispatchWorkgroups(workgroups);

    pass.setPipeline(scene.workerPipeline);
    pass.setBindGroup(0, scene.queueBindGroup);
    pass.setBindGroup(1, scene.effectBindGroup);
    pass.dispatchWorkgroups(workgroups);
    pass.end();

    encoder.copyBufferToBuffer(scene.particlesBuffer, 0, scene.readbackBuffer, 0, particleBufferSize);
    device.queue.submit([encoder.finish()]);

    await scene.readbackBuffer.mapAsync(GPUMapMode.READ);
    const mapped = scene.readbackBuffer.getMappedRange();
    const view = new Float32Array(mapped.slice(0));
    scene.readbackBuffer.unmap();

    scene.render(
      scene.ctx,
      view,
      jobCount,
      scene.canvas.width,
      scene.canvas.height,
      scene,
      time
    );
  };

  return scene;
}

async function main() {
  if (!navigator.gpu) {
    setStatus("WebGPU is not available in this browser.", "error");
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    setStatus("No WebGPU adapter found.", "error");
    return;
  }

  const device = await adapter.requestDevice();

  globalThis.__IMPORT_META_URL__ = new URL("../src/index.js", import.meta.url);
  const {
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
  } = await import("../src/index.js");
  delete globalThis.__IMPORT_META_URL__;

  const gpuWorkerUrl = new URL(
    "../node_modules/@plasius/gpu-worker/dist/index.js",
    import.meta.url
  );
  const { assembleWorkerWgsl } = await import(gpuWorkerUrl);

  const queueWgslUrl = new URL(
    "../node_modules/@plasius/gpu-lock-free-queue/dist/queue.wgsl",
    import.meta.url
  );
  const workerWgslUrl = new URL(
    "../node_modules/@plasius/gpu-worker/dist/worker.wgsl",
    import.meta.url
  );
  const queueWgsl = await fetchText(queueWgslUrl);
  const workerWgsl = await fetchText(workerWgslUrl);

  const queueLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
      { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
      { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
    ],
  });

  const effectLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
    ],
  });

  const scenes = [];
  const fireCanvas = document.getElementById("scene-fire");
  const sparksCanvas = document.getElementById("scene-sparks");
  const textCanvas = document.getElementById("scene-text");
  const rainCanvas = document.getElementById("scene-rain");
  const snowCanvas = document.getElementById("scene-snow");
  const fireworkCanvas = document.getElementById("scene-firework");

  const fireScene = await createScene({
    device,
    queueLayout,
    effectLayout,
    assembleWorkerWgsl,
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
    queueWgsl,
    workerWgsl,
    canvas: fireCanvas,
    effectName: "fire",
    jobKey: "physics",
    maxCount: 700,
    spawnRadius: 0.05,
    origin: [0.5, 0.15],
    drift: [0.0, 0.0],
    render: renderFire,
    extra: {
      torch: { x: 0.5, y: 0.2 },
    },
  });
  fireScene.torch = { x: 0.5, y: 0.2 };
  scenes.push(fireScene);

  const sparksScene = await createScene({
    device,
    queueLayout,
    effectLayout,
    assembleWorkerWgsl,
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
    queueWgsl,
    workerWgsl,
    canvas: sparksCanvas,
    effectName: "sparks",
    jobKey: "update",
    maxCount: 450,
    spawnRadius: 0.01,
    origin: [0.5, 0.4],
    drift: [0.0, -0.2],
    render: renderSparks,
  });
  scenes.push(sparksScene);

  const textBox = { x: 0.35, y: 0.2, w: 0.3, h: 0.25 };
  const textOrigin = [textBox.x + textBox.w / 2, textBox.y + textBox.h + 0.1];
  const textScene = await createScene({
    device,
    queueLayout,
    effectLayout,
    assembleWorkerWgsl,
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
    queueWgsl,
    workerWgsl,
    canvas: textCanvas,
    effectName: "text",
    jobKey: "layout",
    maxCount: 220,
    spawnRadius: 0.03,
    origin: textOrigin,
    drift: [0.0, 0.0],
    render: renderText,
    extra: { box: textBox },
  });
  textScene.box = textBox;
  scenes.push(textScene);

  const rainScene = await createScene({
    device,
    queueLayout,
    effectLayout,
    assembleWorkerWgsl,
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
    queueWgsl,
    workerWgsl,
    canvas: rainCanvas,
    effectName: "rain",
    jobKey: "update",
    maxCount: 900,
    spawnRadius: 0.45,
    origin: [0.5, 1.05],
    drift: [0.03, 0.0],
    intensityEl: document.getElementById("rain-intensity"),
    intensityValueEl: document.getElementById("rain-value"),
    render: renderRain,
  });
  scenes.push(rainScene);

  const snowScene = await createScene({
    device,
    queueLayout,
    effectLayout,
    assembleWorkerWgsl,
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
    queueWgsl,
    workerWgsl,
    canvas: snowCanvas,
    effectName: "snow",
    jobKey: "update",
    maxCount: 600,
    spawnRadius: 0.4,
    origin: [0.5, 1.05],
    drift: [0.08, 0.0],
    intensityEl: document.getElementById("snow-intensity"),
    intensityValueEl: document.getElementById("snow-value"),
    render: renderSnow,
  });
  scenes.push(snowScene);

  const fireworkScene = await createScene({
    device,
    queueLayout,
    effectLayout,
    assembleWorkerWgsl,
    loadParticleEffectPreludeWgsl,
    loadParticleEffectJobWgsl,
    queueWgsl,
    workerWgsl,
    canvas: fireworkCanvas,
    effectName: "firework",
    jobKey: "update",
    maxCount: 900,
    spawnRadius: 0.25,
    origin: [0.5, 0.4],
    drift: [0.02, 0.0],
    intensityEl: document.getElementById("firework-size"),
    intensityValueEl: document.getElementById("firework-value"),
    intensityAffectsCount: false,
    render: renderFirework,
  });
  scenes.push(fireworkScene);

  setStatus("WebGPU ready. Running particle scenes.");

  let lastTime = performance.now();
  async function frame(now) {
    const dt = clamp((now - lastTime) / 1000, 0.001, 0.033);
    lastTime = now;
    const t = now / 1000;
    for (const scene of scenes) {
      await scene.step(t, dt);
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

main().catch((err) => {
  console.error(err);
  setStatus(`Error: ${err.message}`, "error");
});
