// Fire render job: converts simulation state into a visible render pass.

fn process_job(job_index: u32, job_type: u32, payload_words: u32) {
  let _job_guard = job_type;
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

  let seed = u32(particle.pos.w) ^ (particle_index * 31u);
  var pos = particle.pos.xy;
  var vel = particle.vel.xy;
  let is_smoke = particle.vel.z > 0.5;

  if (is_smoke) {
    vel = vel * 0.995;
    vel = vel + effect_params.drift * (effect_params.dt * 0.4);
    life = life - effect_params.dt * 0.42;
  } else {
    vel = vel * 0.985;
    let flicker = rand_signed(seed + u32(effect_params.time * 1200.0)) * 0.007;
    vel.x = vel.x + flicker;
    life = life - effect_params.dt * 0.58;
  }

  pos = pos + vel * effect_params.dt;
  let jitter = rand01(seed + u32(effect_params.time * 400.0)) * 0.001;
  particle.pos = vec4<f32>(pos + vec2<f32>(jitter, jitter), life, f32(seed));
  particle.vel = vec4<f32>(vel, particle.vel.z, particle.vel.w);

  if (life <= 0.0 || pos.x < effect_params.bounds_min.x - 0.25 || pos.x > effect_params.bounds_max.x + 0.25 || pos.y > effect_params.bounds_max.y + 0.2) {
    particle.pos = vec4<f32>(particle.pos.xy, -1.0, particle.pos.z);
  }

  particles[particle_index] = particle;
}
