// Fire update job: torch flame with smoke particles.

fn respawn_fire(seed: u32) -> Particle {
  let r1 = rand01(seed);
  let r2 = rand01(seed ^ 0x9e3779b9u);
  let angle = r1 * TWO_PI;
  let radius = effect_params.spawn_radius * sqrt(r2);
  let offset = vec2<f32>(cos(angle), sin(angle)) * radius;
  let base = effect_params.origin + offset;

  var kind = 0.0; // 0.0 = flame, 1.0 = smoke
  var life = 0.45 + rand01(seed ^ 0x85ebca6bu) * 0.9;
  var vel = vec2<f32>(
    rand_signed(seed ^ 0xc2b2ae35u) * 0.08,
    0.35 + rand01(seed ^ 0x27d4eb2du) * 0.45,
  );
  var size = 1.0 + rand01(seed ^ 0x51a3c1u) * 1.2;

  if (rand01(seed ^ 0x165667b1u) > 0.78) {
    kind = 1.0;
    life = 1.2 + rand01(seed ^ 0x94d049bdu) * 1.6;
    vel = vec2<f32>(
      rand_signed(seed ^ 0x9e3779b9u) * 0.05,
      0.12 + rand01(seed ^ 0x27d4eb2du) * 0.25,
    );
    size = 1.8 + rand01(seed ^ 0x7f4a7c15u) * 2.2;
  }

  return Particle(vec4<f32>(base, life, f32(seed)), vec4<f32>(vel, kind, size));
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
  var seed = u32(particle.pos.w) ^ (particle_index * 31u);

  if (life <= 0.0) {
    particle = respawn_fire(seed + u32(effect_params.time * 1000.0));
    particles[particle_index] = particle;
    return;
  }

  let kind = particle.vel.z;
  let is_smoke = kind > 0.5;
  var vel = particle.vel.xy;
  var pos = particle.pos.xy;

  if (is_smoke) {
    let sway = rand_signed(seed ^ u32(effect_params.time * 900.0)) * 0.02;
    vel.y = vel.y + 0.08 * effect_params.dt;
    vel.x = vel.x + (effect_params.drift.x * 0.4 + sway) * effect_params.dt;
    vel = vel * 0.992;
    life = life - effect_params.dt * 0.45;
  } else {
    let flicker = rand_signed(seed ^ u32(effect_params.time * 1000.0));
    vel.y = vel.y + 0.55 * effect_params.dt;
    vel.x = vel.x + flicker * 0.03;
    vel = vel * 0.985;
    life = life - effect_params.dt * 0.9;
  }

  pos = pos + vel * effect_params.dt;

  if (pos.y > effect_params.bounds_max.y + 0.2 || pos.x < effect_params.bounds_min.x - 0.15 || pos.x > effect_params.bounds_max.x + 0.15) {
    life = -1.0;
  }

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, kind, particle.vel.w);

  if (life <= 0.0) {
    particle = respawn_fire(seed + 97u + u32(effect_params.time * 500.0));
  }

  particles[particle_index] = particle;
}
