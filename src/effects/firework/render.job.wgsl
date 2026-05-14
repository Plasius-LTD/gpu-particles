// Firework render job: advances flare particles and applies life decay.

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
  if (life <= 0.0) {
    return;
  }

  var pos = particle.pos.xy;
  var vel = particle.vel.xy;
  let seed = u32(particle.pos.w) ^ (particle_index * 173u);
  let kind = particle.vel.z;

  vel = vel + effect_params.drift * (effect_params.dt * 0.2);
  if (kind == 1.0) {
    vel = vel * 0.99;
    life = life - effect_params.dt * 0.4;
  } else if (kind == 2.0) {
    vel = vel * 0.985;
    life = life - effect_params.dt * 0.32;
  } else {
    vel.y = vel.y - 1.0 * effect_params.dt;
    life = life - effect_params.dt * 1.1;
  }

  pos = pos + vel * effect_params.dt;
  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);

  if (life <= 0.0 || pos.y < effect_params.bounds_min.y - 0.25 || pos.y > effect_params.bounds_max.y + 0.4 || pos.x < effect_params.bounds_min.x - 0.25 || pos.x > effect_params.bounds_max.x + 0.25) {
    particle.pos = vec4<f32>(particle.pos.xy, -1.0, particle.pos.z);
  }

  particles[particle_index] = particle;
}
