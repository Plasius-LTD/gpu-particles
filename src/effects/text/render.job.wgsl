// Text render job: advances layout particles for text overlays and fade.

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
  let seed = u32(particle.pos.w) ^ (particle_index * 113u);

  vel.x = vel.x + (effect_params.drift.x * 0.05) * effect_params.dt;
  vel.y = vel.y - effect_params.dt * 1.0;
  vel = vel * 0.992;
  pos = pos + vel * effect_params.dt;
  life = life - effect_params.dt * 0.65;

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);

  if (life <= 0.0 || pos.y < effect_params.bounds_min.y - 0.35 || pos.x < effect_params.bounds_min.x - 0.2 || pos.x > effect_params.bounds_max.x + 0.2) {
    particle.pos = vec4<f32>(particle.pos.xy, -1.0, particle.pos.z);
  }

  particles[particle_index] = particle;
}
