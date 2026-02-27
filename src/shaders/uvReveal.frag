uniform sampler2D u_text;   // canvas texture — white text on black
uniform float u_reveal;     // 0 = invisible, 1 = fully revealed
uniform float u_time;       // for pulsing glow

varying vec2 vUv;

void main() {
  float text = texture2D(u_text, vUv).r;

  // Soft outer glow — bleeds slightly beyond the letterforms
  float softText = smoothstep(0.0, 0.6, text);

  // Core glyph — sharp, bright centre
  float coreText = smoothstep(0.4, 0.8, text);

  // Subtle pulse once revealed
  float pulse = 1.0 + sin(u_time * 1.4) * 0.08;

  // UV purple — slightly shifts hue with pulse
  vec3 uvColor    = vec3(0.72, 0.22, 1.0) * pulse;
  vec3 glowColor  = vec3(0.45, 0.05, 0.75);
  vec3 coreColor  = vec3(0.92, 0.75, 1.0);

  // Reveal drives opacity — nothing shows until UV phase
  float revealEased = u_reveal * u_reveal * (3.0 - 2.0 * u_reveal); // smoothstep

  float glowAlpha = softText * revealEased * 0.55;
  float coreAlpha = coreText * revealEased;

  vec3 color = glowColor * glowAlpha + coreColor * coreAlpha;
  float alpha = max(glowAlpha * 0.6, coreAlpha);

  gl_FragColor = vec4(color / max(alpha, 0.001), alpha);
}
