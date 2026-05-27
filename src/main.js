/**
 * main.js — Application entry point and animation loop
 *
 * Sets up the canvas, initializes shared state, wires UI controls,
 * and runs the requestAnimationFrame loop that orchestrates
 * physics computation → rendering → UI updates each frame.
 */

import { zones, zoneResponse, applyCoupling, activeAntiResonance } from './physics.js';
import { createParticles, drawSilhouette, drawVocalFolds, drawVagus } from './anatomy.js';
import { drawZone, drawSystemAura, drawAntiResonance, updateBadge } from './renderer.js';
import { createZoneBars, updateZoneBars, wireControls } from './ui.js';


// ─── Canvas setup ──────────────────────────────────────────────

const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d', { alpha: false });

let W = 0, H = 0;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function resize() {
  const r = canvas.getBoundingClientRect();
  W = r.width;
  H = r.height;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);


// ─── Shared state ──────────────────────────────────────────────
// Mutated by UI handlers and the animation loop.
// Physics reads driveF; rendering reads vt (visual time).

const state = {
  driveF:    220,
  t:         0,       // wall-clock time (ms)
  vt:        0,       // visual time (scaled by timeScale)
  lastT:     0,
  timeScale: 1,       // visualization speed multiplier (NOT physics)
  sweeping:  false,
  sweepDir:  1,
};


// ─── Initialize components ─────────────────────────────────────

const particles = createParticles(18);
const rowEls    = createZoneBars();
const ui        = wireControls(state);


// ─── Animation loop ────────────────────────────────────────────

function frame(now) {
  // Time tracking
  const dt = state.lastT ? (now - state.lastT) : 16;
  state.lastT = now;
  state.t     = now;
  state.vt   += dt * state.timeScale;

  // Sweep
  if (state.sweeping) {
    state.driveF += state.sweepDir * 0.9 * state.timeScale;
    if (state.driveF > 900) state.sweepDir = -1;
    if (state.driveF < 70)  state.sweepDir = 1;
    ui.updateSweepDisplay();
  }

  // ── Physics (time-independent) ──
  const raw  = zones.map(z => zoneResponse(z, state.driveF));
  const amps = applyCoupling(raw);
  const sysAmp      = amps.reduce((s, a) => s + a, 0) / amps.length;
  const activeCount  = amps.filter(a => a > 0.4).length;
  const arActive     = activeAntiResonance(state.driveF);

  // ── Rendering (uses visual time) ──
  // Background fade (motion trails)
  ctx.fillStyle = 'rgba(7,9,12,0.32)';
  ctx.fillRect(0, 0, W, H);

  drawSilhouette(ctx, W, H);
  drawSystemAura(ctx, W, H, sysAmp);
  drawVagus(ctx, W, H, state.vt, sysAmp, particles, state.timeScale);

  zones.forEach((z, i) => drawZone(ctx, W, H, z, amps[i], state.driveF, state.vt));

  if (arActive) {
    drawAntiResonance(ctx, W, H, arActive.ar, arActive.strength, state.vt);
  }

  drawVocalFolds(ctx, W, H, state.driveF, state.vt);

  // ── UI updates ──
  updateZoneBars(rowEls, amps);
  updateBadge(sysAmp, activeCount, arActive);

  requestAnimationFrame(frame);
}


// ─── Boot ──────────────────────────────────────────────────────

resize();
requestAnimationFrame(frame);
