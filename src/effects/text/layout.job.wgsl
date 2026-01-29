// Text layout job.

fn respawn_text(seed: u32) -> Particle {
  let x = effect_params.origin.x + rand_signed(seed) * effect_params.spawn_radius;
  let y = effect_params.origin.y + rand01(seed ^ 0x9e3779b9u) * 0.05;
  let value = f32(hash_u32(seed) % 10000u);
  let lateral = rand_signed(seed ^ 0x85ebca6bu) * 0.12;
  let upward = 0.55 + rand01(seed ^ 0x27d4eb2du) * 0.45;
  let vel = vec2<f32>(lateral, upward);
  let life = 2.2 + rand01(seed ^ 0x51a3c1u) * 1.2;
  return Particle(vec4<f32>(vec2<f32>(x, y), life, f32(seed)), vec4<f32>(vel, 0.0, value));
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
  let seed = u32(particle.pos.w) ^ (particle_index * 113u);

  if (life <= 0.0) {
    let burst = rand01(seed ^ u32(effect_params.time * 120.0));
    if (burst > 0.985) {
      particle = respawn_text(seed + u32(effect_params.time * 600.0));
      particles[particle_index] = particle;
    }
    return;
  }

  var pos = particle.pos.xy;
  var vel = particle.vel.xy;
  let dir = select(-1.0, 1.0, pos.x >= effect_params.origin.x);
  vel.x = vel.x + dir * 0.18 * effect_params.dt;
  vel.x = vel.x + effect_params.drift.x * effect_params.dt * 0.05;
  vel.y = vel.y - 0.95 * effect_params.dt;
  vel = vel * 0.995;
  pos = pos + vel * effect_params.dt;

  if (pos.y < effect_params.bounds_min.y - 0.1 || pos.x < effect_params.bounds_min.x - 0.1 || pos.x > effect_params.bounds_max.x + 0.1) {
    life = -1.0;
  }

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);

  if (life <= 0.0) {
    particle = respawn_text(seed + 37u + u32(effect_params.time * 500.0));
  }

  particles[particle_index] = particle;
}
