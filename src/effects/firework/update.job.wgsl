// Firework update job: explosions with sparks, smoke, and ash.

const KIND_SPARK: f32 = 0.0;
const KIND_SMOKE: f32 = 1.0;
const KIND_ASH: f32 = 2.0;

const PATHS: array<vec2<f32>, 20> = array<vec2<f32>, 20>(
  vec2<f32>(1.0, 0.0),
  vec2<f32>(0.92, 0.38),
  vec2<f32>(0.71, 0.71),
  vec2<f32>(0.38, 0.92),
  vec2<f32>(0.0, 1.0),
  vec2<f32>(-0.38, 0.92),
  vec2<f32>(-0.71, 0.71),
  vec2<f32>(-0.92, 0.38),
  vec2<f32>(-1.0, 0.0),
  vec2<f32>(-0.92, -0.38),
  vec2<f32>(-0.71, -0.71),
  vec2<f32>(-0.38, -0.92),
  vec2<f32>(0.0, -1.0),
  vec2<f32>(0.38, -0.92),
  vec2<f32>(0.71, -0.71),
  vec2<f32>(0.92, -0.38),
  vec2<f32>(0.98, 0.2),
  vec2<f32>(0.2, 0.98),
  vec2<f32>(-0.98, 0.2),
  vec2<f32>(-0.2, 0.98)
);

fn respawn_firework(seed: u32, burst_seed: u32) -> Particle {
  let r2 = rand01(seed ^ 0x9e3779b9u);
  let radius = effect_params.spawn_radius * sqrt(r2);
  let intensity = clamp(effect_params.intensity, 0.1, 2.0);
  let scale = 0.2 + rand01(seed ^ 0x3c6ef372u) * 0.8;
  let size = clamp(scale * intensity, 0.15, 0.95);
  let raw_count = 5u + u32(floor(size * 15.0));
  let path_count = min(20u, max(5u, raw_count));
  let path_index = hash_u32(seed ^ burst_seed) % path_count;
  let path_dir = normalize(PATHS[path_index]);
  let offset = path_dir * (radius * 0.15);
  let base = effect_params.origin + offset;

  let kind_roll = rand01(seed ^ 0x85ebca6bu);
  var kind = KIND_SPARK;
  var life = 0.9 + rand01(seed ^ 0x27d4eb2du) * 1.1;
  var speed = (0.8 + rand01(seed ^ 0xc2b2ae35u) * 2.2) * scale * (0.7 + intensity * 0.3);
  var vel = path_dir * speed;

  if (kind_roll > 0.78) {
    kind = KIND_SMOKE;
    life = 1.8 + rand01(seed ^ 0x51a3c1u) * 2.0;
    speed = 0.08 + rand01(seed ^ 0x94d049bdu) * 0.25;
    vel = vec2<f32>(
      rand_signed(seed ^ 0x7f4a7c15u) * 0.06,
      0.06 + rand01(seed ^ 0x165667b1u) * 0.18
    );
  } else if (kind_roll > 0.6) {
    kind = KIND_ASH;
    life = 1.2 + rand01(seed ^ 0x846ca68bu) * 1.4;
    speed = 0.12 + rand01(seed ^ 0x6c8e9cf5u) * 0.35;
    vel = vec2<f32>(
      rand_signed(seed ^ 0x1b873593u) * 0.18,
      0.18 + rand01(seed ^ 0x27d4eb2du) * 0.28
    );
  }

  let perp = vec2<f32>(-path_dir.y, path_dir.x);
  vel = vel + perp * rand_signed(seed ^ 0x632be5abu) * 0.08 * scale;
  vel.y = vel.y + (0.45 + rand01(seed ^ 0x632be5abu) * 0.55) * scale;

  let color_roll = rand01(seed ^ 0x9e3779b9u);
  var color_index = floor(color_roll * 3.0);
  if (color_roll > 0.92) {
    color_index = 3.0;
  }

  return Particle(vec4<f32>(base, life, f32(seed)), vec4<f32>(vel, kind, color_index + size));
}

fn process_job(job_index: u32, job_type: u32, payload_words: u32) {
  if (payload_words == 0u) {
    return;
  }
  let particle_index = payload_word(job_index, 0u);
  if (particle_index >= arrayLength(&particles)) {
    return;
  }

  var particle = particles[particle_index];
  var life = particle.pos.z;
  let seed = u32(particle.pos.w) ^ (particle_index * 173u);

  let burst_id = u32(effect_params.time * 0.6);
  let burst_seed = burst_id * 0x9e3779b9u;
  let burst_phase = fract(effect_params.time * 0.6);

  if (life <= 0.0) {
    let chance = rand01(seed ^ burst_seed ^ 0x85ebca6bu);
    let window = burst_phase < 0.08;
    let threshold = select(0.995, 0.7 - effect_params.intensity * 0.2, window);
    if (chance > threshold) {
      particle = respawn_firework(seed + burst_seed, burst_seed);
      particles[particle_index] = particle;
    }
    return;
  }

  let kind = particle.vel.z;
  let color_index = floor(particle.vel.w);
  let size = clamp(particle.vel.w - color_index, 0.0, 1.5);
  var pos = particle.pos.xy;
  var vel = particle.vel.xy;

  if (kind == KIND_SPARK) {
    var gravity = 1.1 + color_index * 0.2;
    let drag = 0.985 - size * 0.01;
    if (color_index >= 3.0) {
      gravity = 0.85;
      vel.x = vel.x + sin(effect_params.time * 3.0 + f32(seed) * 0.01) * 0.02;
    }
    vel.y = vel.y - gravity * effect_params.dt;
    vel = vel * drag;
    life = life - effect_params.dt * (1.1 + size * 0.4);
  } else if (kind == KIND_SMOKE) {
    let sway = rand_signed(seed ^ u32(effect_params.time * 900.0)) * 0.02;
    vel.x = vel.x + (effect_params.drift.x * 0.15 + sway) * effect_params.dt;
    vel.y = vel.y - 0.05 * effect_params.dt;
    vel = vel * 0.989;
    life = life - effect_params.dt * 0.55;
  } else {
    vel.y = vel.y - (0.7 + color_index * 0.05) * effect_params.dt;
    vel.x = vel.x + effect_params.drift.x * effect_params.dt * 0.3;
    vel = vel * 0.99;
    life = life - effect_params.dt * 0.75;
  }

  pos = pos + vel * effect_params.dt;

  if (pos.y < effect_params.bounds_min.y - 0.2 || pos.y > effect_params.bounds_max.y + 0.3 || pos.x < effect_params.bounds_min.x - 0.2 || pos.x > effect_params.bounds_max.x + 0.2) {
    life = -1.0;
  }

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, kind, particle.vel.w);

  if (life <= 0.0) {
    let chance = rand01(seed ^ burst_seed ^ 0x27d4eb2du);
    if (chance > 0.985) {
      particle = respawn_firework(seed + 59u + burst_seed, burst_seed);
    }
  }

  particles[particle_index] = particle;
}
