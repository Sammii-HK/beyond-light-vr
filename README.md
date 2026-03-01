# Beyond Light VR

A WebXR reconstruction of my MA Fine Art dissertation installation, originally exhibited in 2017.

## Concept

The original work was a hand-built 2×2×2m cube filmed with five GoPro cameras. The room traversed the entire visible light spectrum — infrared through red, orange, yellow, green, blue, indigo, violet, and finally ultraviolet. Quotes about consciousness, death, and perception were screen-printed onto the acetate walls in UV-reactive ink. They were completely invisible throughout the colour journey, only blazing to life when the room reached ultraviolet. Then the room dissolved into white.

This is that experience, rebuilt for the web.

## Experience

The room moves through nine phases of the spectrum automatically. You have 50 seconds to read the four quotes in the UV phase before the bloom surges and everything dissolves into white light.

- **Drag** to look around (desktop)
- **Touch drag** to look around (mobile)
- **Advance →** to skip forward manually
- **Enter VR** on a compatible headset

## Quotes

> The boundaries which divide life from death are at best shadowy and vague. Who shall say where the one ends, and where the other begins?
> — Edgar Allan Poe

> Our birth is but a sleep and a forgetting. The soul that rises with us, our life's star, hath had elsewhere its setting, and cometh from afar.
> — William Wordsworth

> There is a moment where your body will be dead but your brain is alive. It is said there are 6 to 12 minutes of brain activity after death. As a second of dream time is infinitely longer than a waking one, those minutes could be your entire life.

> Doesn't it make sense that after death your conscious life would continue as a dream body — a dream state which you cannot wake from.

## Technical

- **Three.js** (r170) with WebXR support
- **GLSL shaders** — custom UV reveal shader with three-layer glow (halo, mid, core) and slow pulse
- **fBm wall shader** — fractional Brownian motion noise for organic wall texture and vignette depth
- **UnrealBloomPass** post-processing — decoupled from reveal, surges only after the reading window
- **Futura Medium** typography rendered to canvas texture
- **Vite** build tooling

## Live

[beyond-light-vr.vercel.app](https://beyond-light-vr.vercel.app)

## Original Installation

Filmed with five GoPro cameras, 2017. UV-reactive screen-print on acetate.
