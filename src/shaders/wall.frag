uniform vec3 u_color;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Bilinear smooth noise — no hard edges
float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 3 octaves of layered noise — each octave is finer detail at half amplitude.
// This is what makes things look organic rather than either blocky or AI-perfect.
float fbm(vec2 p) {
  float v   = 0.0;
  float amp = 0.52;
  float f   = 1.0;
  for (int i = 0; i < 3; i++) {
    v   += smoothNoise(p * f) * amp;
    amp *= 0.48;
    f   *= 2.3;
  }
  return v; // range roughly 0.0–0.88, centre ~0.44
}

void main() {
  vec2 centered = vUv - 0.5;
  float dist = length(centered);

  // Radial vignette — bright centre (UV lamp), dark edges and corners
  float vignette = 1.0 - smoothstep(0.1, 0.68, dist * 1.5);

  // fBm texture — large organic swells + mid detail + fine grain, all smooth
  // Frequency 4.5 → biggest swell spans ~22% of the wall. Feels physical.
  float noise = (fbm(vUv * 4.5) - 0.44) * 0.18;

  // Centre ~88% bright, edges ~16%, plus organic variation
  float brightness = 0.16 + vignette * 0.72 + noise;

  gl_FragColor = vec4(clamp(u_color * brightness, 0.0, 1.0), 1.0);
}
