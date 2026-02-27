import * as THREE from 'three';
import vertexShader from './shaders/wall.vert?raw';
import fragmentShader from './shaders/wall.frag?raw';

// Room is 6 units wide — matches quote placement in quotes.js
const ROOM_SIZE = 14;
const HALF = ROOM_SIZE / 2;

let _scene = null;
const _wallMeshes = [];

function makeWallMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_color: { value: new THREE.Color() },
    },
  });
}

export function createRoom(scene) {
  _scene = scene;

  // 6 faces — each a PlaneGeometry facing inward
  const faces = [
    { pos: [0, 0, -HALF], rot: [0, 0, 0] },                   // front
    { pos: [0, 0,  HALF], rot: [0, Math.PI, 0] },             // back
    { pos: [-HALF, 0, 0], rot: [0,  Math.PI / 2, 0] },        // left
    { pos: [ HALF, 0, 0], rot: [0, -Math.PI / 2, 0] },        // right
    { pos: [0,  HALF, 0], rot: [ Math.PI / 2, 0, 0] },        // ceiling
    { pos: [0, -HALF, 0], rot: [-Math.PI / 2, 0, 0] },        // floor
  ];

  for (const { pos, rot } of faces) {
    const geo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
    const mat = makeWallMaterial();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    scene.add(mesh);
    _wallMeshes.push(mesh);
  }
}

export function updateRoom(phaseState) {
  if (!_scene) return;
  const { color, fogColor } = phaseState;

  _scene.background.setRGB(color.r, color.g, color.b);
  _scene.fog.color.setRGB(fogColor.r, fogColor.g, fogColor.b);

  for (const mesh of _wallMeshes) {
    mesh.material.uniforms.u_color.value.setRGB(color.r, color.g, color.b);
  }
}
