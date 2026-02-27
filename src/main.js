import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PHASES, TRANSITION_DURATION, lerpPhase } from './journey.js';
import { createRoom, updateRoom } from './room.js';
import { createQuoteMeshes, updateQuotes } from './quotes.js';

// ── Renderer ──────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.toneMapping = THREE.NoToneMapping;
document.body.appendChild(renderer.domElement);

// VR button
document.getElementById('vr-btn-container').appendChild(VRButton.createButton(renderer));

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 4, 18);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 0);

// ── Post-processing ───────────────────────────────────────────────────────────
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0,    // strength — ramped via power curve so text is readable before bloom surges
  0.45, // radius — tighter so glow hugs the letterforms, doesn't flood the room
  0.18  // threshold — only the bright core pixels bloom, not the whole halo
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ── Objects ───────────────────────────────────────────────────────────────────
createRoom(scene);
const quoteMeshes = createQuoteMeshes(scene, 14);

// ── Mouse-look (non-VR) ───────────────────────────────────────────────────────
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
let isDragging = false;
let lastX = 0;
let lastY = 0;

renderer.domElement.addEventListener('mousedown', e => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  document.getElementById('look-hint').classList.add('fade');
});
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', e => {
  if (!isDragging || renderer.xr.isPresenting) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  euler.y -= dx * 0.003;
  euler.x -= dy * 0.003;
  euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.x));
  camera.quaternion.setFromEuler(euler);
});

// Touch look for mobile
renderer.domElement.addEventListener('touchstart', e => {
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
  document.getElementById('look-hint').classList.add('fade');
});
renderer.domElement.addEventListener('touchmove', e => {
  if (renderer.xr.isPresenting) return;
  const dx = e.touches[0].clientX - lastX;
  const dy = e.touches[0].clientY - lastY;
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
  euler.y -= dx * 0.003;
  euler.x -= dy * 0.003;
  euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.x));
  camera.quaternion.setFromEuler(euler);
});

// Device orientation (mobile gyroscope)
let deviceOrientation = null;
window.addEventListener('deviceorientation', e => {
  deviceOrientation = e;
});

// ── Journey state ─────────────────────────────────────────────────────────────
let currentPhase = 0;
let phaseStartTime = performance.now();
let transitionStartTime = null;
let transitionFrom = null;
let isTransitioning = false;

// ── UV bloom timer — decoupled from reveal ────────────────────────────────────
// Quotes are readable for QUOTE_READ_TIME, then bloom surges to white-out.
const QUOTE_READ_TIME = 50000; // 50 s of reading time before bloom starts
const BLOOM_RAMP_TIME = 9000;  // 9 s from first glow to full white-out
let uvEnteredTime = null;      // set when UV phase fully settles

function advancePhase() {
  if (currentPhase >= PHASES.length - 1) return;
  transitionFrom = currentPhase;
  currentPhase++;
  transitionStartTime = performance.now();
  isTransitioning = true;

  const label = document.getElementById('phase-label');
  label.textContent = PHASES[currentPhase].label;

  if (currentPhase === PHASES.length - 1) {
    document.getElementById('advance-btn').classList.add('hidden');
  }
}

// Advance button
document.getElementById('advance-btn').addEventListener('click', advancePhase);

// Auto-advance (respects each phase's duration)
function checkAutoAdvance(now) {
  if (isTransitioning) return;
  if (currentPhase >= PHASES.length - 1) return;
  const phase = PHASES[currentPhase];
  if (phase.duration === Infinity) return;
  if (now - phaseStartTime > phase.duration) {
    advancePhase();
  }
}

function getCurrentState(now) {
  if (!isTransitioning) return PHASES[currentPhase];

  const t = Math.min((now - transitionStartTime) / TRANSITION_DURATION, 1);
  if (t >= 1) {
    isTransitioning = false;
    phaseStartTime = now;
    return PHASES[currentPhase];
  }

  // Ease in-out
  const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  return lerpPhase(PHASES[transitionFrom], PHASES[currentPhase], eased);
}

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ── Animate ───────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const now = performance.now();
  const elapsed = clock.getElapsedTime();

  checkAutoAdvance(now);
  const state = getCurrentState(now);

  // Update room atmosphere (background + fog)
  updateRoom(state);

  // Update quote reveal
  updateQuotes(quoteMeshes, state.reveal, elapsed);

  // Track when UV phase fully settles (transition complete, last phase)
  const inUV = currentPhase === PHASES.length - 1 && !isTransitioning;
  if (inUV && uvEnteredTime === null) uvEnteredTime = now;
  if (!inUV) uvEnteredTime = null;

  // Bloom is completely independent of reveal.
  // Zero during all colour phases and during the reading window.
  // Only surges once the audience has had time to read all four quotes.
  let bloomStrength = 0;
  if (uvEnteredTime !== null) {
    const uvAge = now - uvEnteredTime;
    if (uvAge > QUOTE_READ_TIME) {
      const rampT = Math.min((uvAge - QUOTE_READ_TIME) / BLOOM_RAMP_TIME, 1);
      const eased = rampT * rampT * rampT; // cubic — slow build, explosive finish
      bloomStrength = eased * 3.5;
    }
  }
  bloomPass.strength = bloomStrength;

  // Use composer (with bloom) in non-VR mode, plain renderer in VR
  if (renderer.xr.isPresenting) {
    renderer.render(scene, camera);
  } else {
    composer.render();
  }
});
