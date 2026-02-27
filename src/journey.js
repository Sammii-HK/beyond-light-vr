// The spectrum journey — IR through UV
// Each phase defines the room atmosphere and whether quotes are revealed

export const PHASES = [
  {
    name: 'infrared',
    label: 'infrared',
    color: { r: 0,   g: 0,   b: 0   },
    fogColor: { r: 0,   g: 0,   b: 0   },
    intensity: 0,
    reveal: 0,
    duration: 8000,
  },
  {
    name: 'red',
    label: 'red  700nm',
    color: { r: 0.55, g: 0,    b: 0    },
    fogColor: { r: 0.18, g: 0,    b: 0    },
    intensity: 0.6,
    reveal: 0,
    duration: 10000,
  },
  {
    name: 'orange',
    label: 'orange  620nm',
    color: { r: 0.8,  g: 0.28, b: 0    },
    fogColor: { r: 0.25, g: 0.08, b: 0    },
    intensity: 0.7,
    reveal: 0,
    duration: 8000,
  },
  {
    name: 'yellow',
    label: 'yellow  580nm',
    color: { r: 0.8,  g: 0.72, b: 0    },
    fogColor: { r: 0.22, g: 0.18, b: 0    },
    intensity: 0.8,
    reveal: 0,
    duration: 8000,
  },
  {
    name: 'green',
    label: 'green  530nm',
    color: { r: 0,    g: 0.5,  b: 0.05 },
    fogColor: { r: 0,    g: 0.12, b: 0.01 },
    intensity: 0.7,
    reveal: 0,
    duration: 8000,
  },
  {
    name: 'blue',
    label: 'blue  470nm',
    color: { r: 0,    g: 0.22, b: 0.9  },
    fogColor: { r: 0,    g: 0.05, b: 0.22 },
    intensity: 0.7,
    reveal: 0,
    duration: 8000,
  },
  {
    name: 'indigo',
    label: 'indigo  440nm',
    color: { r: 0.18, g: 0,    b: 0.65 },
    fogColor: { r: 0.05, g: 0,    b: 0.18 },
    intensity: 0.65,
    reveal: 0,
    duration: 8000,
  },
  {
    name: 'violet',
    label: 'violet  400nm',
    color: { r: 0.5,  g: 0,    b: 0.9  },
    fogColor: { r: 0.12, g: 0,    b: 0.22 },
    intensity: 0.6,
    reveal: 0,
    duration: 8000,
  },
  {
    name: 'ultraviolet',
    label: 'ultraviolet  380nm',
    color: { r: 0.06, g: 0,    b: 0.14 },
    fogColor: { r: 0.02, g: 0,    b: 0.05 },
    intensity: 0.15,
    reveal: 1,       // quotes fully revealed
    duration: Infinity,
  },
];

export const TRANSITION_DURATION = 2500; // ms to cross-fade between phases

// Lerp between two phase colour objects
export function lerpPhase(a, b, t) {
  const lerp = (x, y) => x + (y - x) * t;
  return {
    color: {
      r: lerp(a.color.r, b.color.r),
      g: lerp(a.color.g, b.color.g),
      b: lerp(a.color.b, b.color.b),
    },
    fogColor: {
      r: lerp(a.fogColor.r, b.fogColor.r),
      g: lerp(a.fogColor.g, b.fogColor.g),
      b: lerp(a.fogColor.b, b.fogColor.b),
    },
    intensity: lerp(a.intensity, b.intensity),
    reveal: lerp(a.reveal, b.reveal),
  };
}
