// Sparks render job: stabilizes spark trajectories for visible world-space output.

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
  let seed = u32(particle.pos.w) ^ (particle_index * 131u);

  let burst = rand_signed(seed + u32(effect_params.time * 900.0));
  vel.x = vel.x + burst * 0.006;
  vel.y = vel.y - 0.8 * effect_params.dt;
  life = life - effect_params.dt * 0.75;
  pos = pos + vel * effect_params.dt;

  particle.pos = vec4<f32>(pos, life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);
  if (pos.y < effect_params.bounds_min.y - 0.4 || pos.x < effect_params.bounds_min.x - 0.4 || pos.x > effect_params.bounds_max.x + 0.4) {
    particle.pos = vec4<f32>(particle.pos.xy, -1.0, particle.pos.z);
  }

  particles[particle_index] = particle;
}
