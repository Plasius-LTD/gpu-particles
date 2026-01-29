// Text overlay effect shared WGSL definitions.

struct Particle {
  pos: vec4<f32>,
  vel: vec4<f32>,
};

struct EffectParams {
  time: f32,
  dt: f32,
  intensity: f32,
  spawn_radius: f32,
  bounds_min: vec2<f32>,
  bounds_max: vec2<f32>,
  origin: vec2<f32>,
  drift: vec2<f32>,
};

@group(1) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(1) @binding(1) var<uniform> effect_params: EffectParams;

fn hash_u32(x: u32) -> u32 {
  var v = x;
  v = v ^ (v >> 16u);
  v = v * 0x7feb352du;
  v = v ^ (v >> 15u);
  v = v * 0x846ca68bu;
  v = v ^ (v >> 16u);
  return v;
}

fn rand01(seed: u32) -> f32 {
  let v = hash_u32(seed) & 0x00ffffffu;
  return f32(v) / 16777216.0;
}

fn rand_signed(seed: u32) -> f32 {
  return rand01(seed) * 2.0 - 1.0;
}
