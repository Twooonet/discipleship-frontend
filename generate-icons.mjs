// Run once: node generate-icons.mjs
// Generates icon-192.png and icon-512.png in the public folder

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#6d28d9');
  grad.addColorStop(1, '#4c1d95');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Cross
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  const cw = size * 0.12;
  const ch = size * 0.55;
  const cx = size / 2 - cw / 2;
  const cy = size * 0.2;
  const hbw = size * 0.38;
  const hbh = size * 0.12;
  const hbx = size / 2 - hbw / 2;
  const hby = size * 0.32;

  ctx.fillRect(cx, cy, cw, ch);
  ctx.fillRect(hbx, hby, hbw, hbh);

  return canvas.toBuffer('image/png');
}

try {
  writeFileSync('public/icon-192.png', drawIcon(192));
  writeFileSync('public/icon-512.png', drawIcon(512));
  console.log('Icons generated!');
} catch {
  console.log('canvas not available — using fallback SVG icons');
}
