// Rain render job: applies downward drift and wrap/death handling for drops.

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
  let seed = u32(particle.pos.w) ^ (particle_index * 97u);

  pos = pos + vel * effect_params.dt;
  vel.x = vel.x + effect_params.drift.x * effect_params.dt;
  life = life - effect_params.dt * 0.28;

  if (pos.y < effect_params.bounds_min.y - 0.15) {
    life = -1.0;
  }

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);

  particles[particle_index] = particle;
}
