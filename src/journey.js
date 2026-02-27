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
    duration: 3000,
  },
  {
    name: 'red',
    label: 'red  700nm',
    color: { r: 1,    g: 0,    b: 0    },
    fogColor: { r: 0.4,  g: 0,    b: 0    },
    intensity: 0.6,
    reveal: 0,
    duration: 4500,
  },
  {
    name: 'orange',
    label: 'orange  620nm',
    color: { r: 1,    g: 0.4,  b: 0    },
    fogColor: { r: 0.4,  g: 0.15, b: 0    },
    intensity: 0.7,
    reveal: 0,
    duration: 3500,
  },
  {
    name: 'yellow',
    label: 'yellow  580nm',
    color: { r: 1,    g: 0.9,  b: 0    },
    fogColor: { r: 0.35, g: 0.3,  b: 0    },
    intensity: 0.8,
    reveal: 0,
    duration: 3500,
  },
  {
    name: 'green',
    label: 'green  530nm',
    color: { r: 0,    g: 0.9,  b: 0.1  },
    fogColor: { r: 0,    g: 0.3,  b: 0.04 },
    intensity: 0.7,
    reveal: 0,
    duration: 3500,
  },
  {
    name: 'blue',
    label: 'blue  470nm',
    color: { r: 0,    g: 0.3,  b: 1    },
    fogColor: { r: 0,    g: 0.08, b: 0.35 },
    intensity: 0.7,
    reveal: 0,
    duration: 3500,
  },
  {
    name: 'indigo',
    label: 'indigo  440nm',
    color: { r: 0.28, g: 0,    b: 0.9  },
    fogColor: { r: 0.08, g: 0,    b: 0.3  },
    intensity: 0.65,
    reveal: 0,
    duration: 3000,
  },
  {
    name: 'violet',
    label: 'violet  400nm',
    color: { r: 0.65, g: 0,    b: 1    },
    fogColor: { r: 0.2,  g: 0,    b: 0.35 },
    intensity: 0.6,
    reveal: 0,
    duration: 3000,
  },
  {
    name: 'ultraviolet',
    label: 'ultraviolet  380nm',
    color: { r: 0.1,  g: 0.06, b: 0.75 }, // deep electric blue-violet — UV blacklight
    fogColor: { r: 0.04, g: 0.02, b: 0.3  },
    intensity: 0.1,
    reveal: 1,
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
