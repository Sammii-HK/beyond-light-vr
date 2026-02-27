import * as THREE from 'three';

export function createRoom(scene, size = 10) {
  // Inside-out box — we're standing inside it
  const geometry = new THREE.BoxGeometry(size, size, size);

  const material = new THREE.MeshStandardMaterial({
    color: 0x050508,
    side: THREE.BackSide,
    roughness: 0.95,
    metalness: 0.0,
  });

  const room = new THREE.Mesh(geometry, material);
  scene.add(room);
  return room;
}

export function createLighting(scene) {
  // Ambient — very low base level, changes colour with phase
  const ambient = new THREE.AmbientLight(0x000000, 0.3);
  scene.add(ambient);

  // Main point light in center — this is the "light source" of each spectrum phase
  const point = new THREE.PointLight(0x000000, 0, 20, 1.5);
  point.position.set(0, 0, 0);
  scene.add(point);

  // Subtle fill from above — gives depth to the room
  const fill = new THREE.PointLight(0x000000, 0, 12, 2);
  fill.position.set(0, 3.5, 0);
  scene.add(fill);

  return { ambient, point, fill };
}

export function updateRoom(lights, phaseState) {
  const { color, intensity } = phaseState;
  const c = new THREE.Color(color.r, color.g, color.b);

  lights.ambient.color.copy(c);
  lights.ambient.intensity = intensity * 0.25;

  lights.point.color.copy(c);
  lights.point.intensity = intensity * 2.8;

  lights.fill.color.copy(c);
  lights.fill.intensity = intensity * 0.6;
}
