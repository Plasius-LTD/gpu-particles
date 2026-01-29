// Snow update job.

fn rand_signed(seed: u32) -> f32 {
  return rand01(seed) * 2.0 - 1.0;
}

fn respawn_snow(seed: u32) -> Particle {
  let x = effect_params.origin.x + rand_signed(seed) * effect_params.spawn_radius;
  let y = effect_params.origin.y + rand01(seed ^ 0x9e3779b9u) * 0.1;
  let speed = 0.12 + rand01(seed ^ 0x85ebca6bu) * 0.2;
  let drift = rand_signed(seed ^ 0x27d4eb2du) * 0.05;
  let vel = vec2<f32>(drift + effect_params.drift.x * 0.2, -speed);
  return Particle(vec4<f32>(vec2<f32>(x, y), 1.0, f32(seed)), vec4<f32>(vel, 0.0, 0.0));
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
  let seed = u32(particle.pos.w) ^ (particle_index * 67u);

  if (life <= 0.0) {
    particle = respawn_snow(seed + u32(effect_params.time * 200.0));
    particles[particle_index] = particle;
    return;
  }

  var pos = particle.pos.xy;
  var vel = particle.vel.xy;
  let sway = sin(effect_params.time * 0.8 + f32(seed) * 0.01) * 0.02;
  vel.x = vel.x + sway + effect_params.drift.x * effect_params.dt * 0.4;
  pos = pos + vel * effect_params.dt;

  if (pos.y < effect_params.bounds_min.y - 0.1) {
    life = -1.0;
  }

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);

  if (life <= 0.0) {
    particle = respawn_snow(seed + 29u + u32(effect_params.time * 300.0));
  }

  particles[particle_index] = particle;
}
