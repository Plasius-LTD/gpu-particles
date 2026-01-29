// Sparks update job.

fn respawn_spark(seed: u32) -> Particle {
  let angle = rand01(seed) * TWO_PI;
  let speed = 0.5 + rand01(seed ^ 0x9e3779b9u) * 1.6;
  let radius = effect_params.spawn_radius * rand01(seed ^ 0x85ebca6bu);
  let offset = vec2<f32>(cos(angle), sin(angle)) * radius;
  let pos = effect_params.origin + offset;
  let vel = vec2<f32>(cos(angle), sin(angle)) * speed;
  let life = 0.3 + rand01(seed ^ 0x27d4eb2du) * 0.7;
  return Particle(vec4<f32>(pos, life, f32(seed)), vec4<f32>(vel, 1.0, 0.0));
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
  let seed = u32(particle.pos.w) ^ (particle_index * 131u);

  if (life <= 0.0) {
    particle = respawn_spark(seed + u32(effect_params.time * 500.0));
    particles[particle_index] = particle;
    return;
  }

  var vel = particle.vel.xy;
  var pos = particle.pos.xy;
  vel.y = vel.y - 1.4 * effect_params.dt + effect_params.drift.y * effect_params.dt;
  vel.x = vel.x + effect_params.drift.x * effect_params.dt;
  vel = vel * 0.985;
  pos = pos + vel * effect_params.dt;
  life = life - effect_params.dt * 1.5;

  if (pos.y < effect_params.bounds_min.y - 0.2 || pos.y > effect_params.bounds_max.y + 0.2) {
    life = -1.0;
  }

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);

  if (life <= 0.0) {
    particle = respawn_spark(seed + 19u + u32(effect_params.time * 700.0));
  }

  particles[particle_index] = particle;
}
