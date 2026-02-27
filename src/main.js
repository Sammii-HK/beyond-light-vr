import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { PHASES, TRANSITION_DURATION, lerpPhase } from './journey.js';
import { createRoom, createLighting, updateRoom } from './room.js';
import { createQuoteMeshes, updateQuotes } from './quotes.js';

// ── Renderer ──────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// VR button
document.getElementById('vr-btn-container').appendChild(VRButton.createButton(renderer));

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 4, 14);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 0);

// ── Objects ───────────────────────────────────────────────────────────────────
createRoom(scene);
const lights = createLighting(scene);
const quoteMeshes = createQuoteMeshes(scene, 10);

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
});

// ── Animate ───────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const now = performance.now();
  const elapsed = clock.getElapsedTime();

  checkAutoAdvance(now);
  const state = getCurrentState(now);

  // Update fog
  const fc = state.fogColor;
  scene.fog.color.setRGB(fc.r, fc.g, fc.b);
  scene.background.setRGB(fc.r * 0.5, fc.g * 0.5, fc.b * 0.5);

  // Update lighting
  updateRoom(lights, state);

  // Update quote reveal
  updateQuotes(quoteMeshes, state.reveal, elapsed);

  renderer.render(scene, camera);
});
