import * as THREE from 'three';
import vertexShader from './shaders/uvReveal.vert?raw';
import fragmentShader from './shaders/uvReveal.frag?raw';

const QUOTES = [
  {
    lines: [
      'The boundaries which divide life from death',
      'are at best shadowy and vague.',
      'Who shall say where the one ends,',
      'and where the other begins?',
    ],
    author: '— Edgar Allan Poe',
    wall: 'front',
  },
  {
    lines: [
      'Our birth is but a sleep and a forgetting.',
      'The soul that rises with us, our life\u2019s star,',
      'hath had elsewhere its setting,',
      'and cometh from afar.',
    ],
    author: '— William Wordsworth',
    wall: 'back',
  },
  {
    lines: [
      'There is a moment where your body will be dead',
      'but your brain is alive.',
      'It is said there are 6 to 12 minutes of brain activity after death.',
      'As a second of dream time is infinitely longer than a waking one,',
      'those minutes could be your entire life.',
    ],
    author: '',
    wall: 'left',
  },
  {
    lines: [
      'Doesn\'t it make sense that after death',
      'your conscious life would continue',
      'as a dream body —',
      'a dream state which you cannot wake from.',
    ],
    author: '',
    wall: 'right',
  },
];

function makeTextCanvas(quote) {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  const fontSize = 46;
  const lineHeight = fontSize * 1.65;

  // Vertically centre the whole block on the canvas
  const authorLines = quote.author ? 1 : 0;
  const totalHeight = (quote.lines.length + authorLines) * lineHeight;
  let y = (H - totalHeight) / 2 + lineHeight * 0.8;

  ctx.font = `500 ${fontSize}px "Futura PT", Futura, "Century Gothic", "Trebuchet MS", sans-serif`;

  for (const line of quote.lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  if (quote.author) {
    ctx.font = `400 ${Math.floor(fontSize * 0.58)}px "Futura PT", Futura, "Century Gothic", "Trebuchet MS", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    y += lineHeight * 0.3;
    ctx.fillText(quote.author, W / 2, y);
  }

  return canvas;
}

function wallTransform(wall, roomSize) {
  const s = roomSize / 2 - 0.05; // just inside the wall
  switch (wall) {
    case 'front':
      return { pos: [0, 0, -s], rot: [0, 0, 0] };
    case 'back':
      return { pos: [0, 0,  s], rot: [0, Math.PI, 0] };
    case 'left':
      return { pos: [-s, 0, 0], rot: [0,  Math.PI / 2, 0] };
    case 'right':
      return { pos: [ s, 0, 0], rot: [0, -Math.PI / 2, 0] };
    default:
      return { pos: [0, 0, 0], rot: [0, 0, 0] };
  }
}

export function createQuoteMeshes(scene, roomSize = 10) {
  const meshes = [];

  for (const quote of QUOTES) {
    const canvas = makeTextCanvas(quote);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_text:   { value: texture },
        u_reveal: { value: 0 },
        u_time:   { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });

    // Aspect ratio of the canvas
    const aspect = canvas.width / canvas.height;
    const planeW = roomSize * 0.45;
    const planeH = planeW / aspect;

    const geometry = new THREE.PlaneGeometry(planeW, planeH);
    const mesh = new THREE.Mesh(geometry, material);

    const { pos, rot } = wallTransform(quote.wall, roomSize);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);

    scene.add(mesh);
    meshes.push(mesh);
  }

  return meshes;
}

export function updateQuotes(meshes, reveal, time) {
  for (const mesh of meshes) {
    mesh.material.uniforms.u_reveal.value = reveal;
    mesh.material.uniforms.u_time.value = time;
  }
}
