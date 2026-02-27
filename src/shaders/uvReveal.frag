uniform sampler2D u_text;   // canvas texture — white text on black
uniform float u_reveal;     // 0 = invisible, 1 = fully revealed
uniform float u_time;       // for pulsing glow

varying vec2 vUv;

void main() {
  float text = texture2D(u_text, vUv).r;

  // Wide soft halo — like fluorescent paint bleeding under UV light
  float halo     = smoothstep(0.0,  0.55, text);
  // Tighter mid glow
  float midGlow  = smoothstep(0.15, 0.75, text);
  // Sharp bright core — the white-hot centre of the letterform
  float core     = smoothstep(0.45, 0.85, text);

  // Subtle slow pulse — like an LED flickering
  float pulse = 1.0 + sin(u_time * 0.9) * 0.06;

  // Colour layers:
  // halo    = wide UV-purple bleed
  // midGlow = blue-white transition
  // core    = pure white (fluorescent material glowing)
  vec3 haloColor    = vec3(0.35, 0.2, 0.9);          // UV purple outer bleed
  vec3 midColor     = vec3(0.65, 0.7, 1.0);           // blue-white mid
  vec3 coreColor    = vec3(0.92, 0.95, 1.0) * pulse;  // white-hot core

  float revealEased = u_reveal * u_reveal * (3.0 - 2.0 * u_reveal);

  float haloAlpha = halo    * revealEased * 0.45;
  float midAlpha  = midGlow * revealEased * 0.75;
  float coreAlpha = core    * revealEased;

  // Layered colour — halo bleeds widest, core is brightest
  vec3 color = haloColor * haloAlpha
             + midColor  * midAlpha
             + coreColor * coreAlpha;

  float alpha = max(max(haloAlpha * 0.5, midAlpha * 0.65), coreAlpha);

  gl_FragColor = vec4(color / max(alpha, 0.001), alpha);
}
