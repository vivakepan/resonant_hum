/**
 * physics.js — Coupled-oscillator resonance model
 *
 * Defines the 10 resonant zones of the vocal/cranial system,
 * computes harmonic response curves, inter-zone coupling,
 * and anti-resonance notches at geometric-mean frequencies.
 *
 * Physics is deterministic and time-independent:
 * given a drive frequency, the response of every zone is fixed.
 * Visual timing is handled separately in main.js.
 */

// ─── Zone definitions ──────────────────────────────────────────
// Each zone: anatomical id, display name, normalized canvas position (nx, ny),
// visual radius, natural resonant frequency (Hz), Q factor (sharpness), color.
// Positions are in [0,1] relative to the canvas viewport.

export const zones = [
  { id: 'chest',    name: 'Chest cavity',    nx: 0.50, ny: 0.78, r: 90,  freq: 120, Q: 0.35, color: '#ff7a3c' },
  { id: 'heart',    name: 'Heart',           nx: 0.45, ny: 0.69, r: 30,  freq: 105, Q: 0.28, color: '#ff4d6d' },
  { id: 'tracheal', name: 'Tracheal column', nx: 0.50, ny: 0.62, r: 24,  freq: 180, Q: 0.45, color: '#ff9550' },
  { id: 'larynx',   name: 'Larynx · folds',  nx: 0.50, ny: 0.52, r: 18,  freq: 220, Q: 0.20, color: '#ffc14a', isDriver: true },
  { id: 'pharynx',  name: 'Pharynx',         nx: 0.50, ny: 0.45, r: 26,  freq: 300, Q: 0.50, color: '#ffe07a' },
  { id: 'mouth',    name: 'Oral cavity',      nx: 0.56, ny: 0.36, r: 32,  freq: 420, Q: 0.55, color: '#8be58f' },
  { id: 'nasal',    name: 'Nasal / sinuses',  nx: 0.51, ny: 0.30, r: 24,  freq: 580, Q: 0.60, color: '#6ad7ff' },
  { id: 'skull',    name: 'Cranial bone',     nx: 0.50, ny: 0.20, r: 65,  freq: 520, Q: 0.40, color: '#4fd6c4' },
  { id: 'eyes',     name: 'Orbital cavities', nx: 0.56, ny: 0.26, r: 12,  freq: 680, Q: 0.70, color: '#7ee0ff' },
  { id: 'ears',     name: 'Inner ear',        nx: 0.42, ny: 0.26, r: 11,  freq: 760, Q: 0.80, color: '#b48cff' },
];


// ─── Anti-resonance pairs ──────────────────────────────────────
// For each adjacent pair of zones (sorted by natural frequency),
// the geometric mean √(f₁·f₂) is the canonical anti-resonance
// notch frequency for two coupled oscillators.
//
// Stylization note: real anti-resonance requires complex-amplitude
// phase math. This model uses a Gaussian subtraction at the notch
// frequency — qualitatively correct, not phase-derived.

export const antiResonances = (() => {
  const sorted = [...zones].sort((a, b) => a.freq - b.freq);
  const pairs = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (b.freq / a.freq > 2.2) continue;  // too far apart → coupling negligible
    const f     = Math.sqrt(a.freq * b.freq);
    const gap   = b.freq - a.freq;
    const width = Math.max(6, gap * 0.13);  // narrow notch
    const depth = 0.85;                     // deep notch
    pairs.push({ a, b, f, width, depth });
  }
  return pairs;
})();


// ─── Anti-resonance factor for a single zone ───────────────────
// Returns a multiplier in [0, 1] that suppresses a zone's response
// when the drive frequency lands in a notch it participates in.

export function antiResonanceFactor(zone, driveF) {
  let factor = 1.0;
  for (const ar of antiResonances) {
    if (ar.a !== zone && ar.b !== zone) continue;
    const d = Math.abs(driveF - ar.f);
    if (d > ar.width * 3) continue;
    const dip = ar.depth * Math.exp(-Math.pow(d / ar.width, 2));
    factor *= (1 - dip);
  }
  return factor;
}


// ─── Active anti-resonance detection ───────────────────────────
// Returns the strongest anti-resonance pair currently excited,
// or null if the drive frequency isn't near any notch.

export function activeAntiResonance(driveF) {
  let best = null, bestScore = 0;
  for (const ar of antiResonances) {
    const d = Math.abs(driveF - ar.f);
    if (d > ar.width * 2.2) continue;
    const score = Math.exp(-Math.pow(d / ar.width, 2));
    if (score > bestScore) { bestScore = score; best = ar; }
  }
  return best ? { ar: best, strength: bestScore } : null;
}


// ─── Zone response to a drive frequency ────────────────────────
// Checks harmonics h=1..8 of driveF against the zone's natural
// frequency. Each harmonic's contribution falls off as h^0.55.
// The best-matching harmonic wins. Anti-resonance is applied last.

export function zoneResponse(zone, driveF) {
  let best = 0;
  for (let h = 1; h <= 8; h++) {
    const hf    = driveF * h;
    const ratio = hf / zone.freq;
    if (ratio < 0.25 || ratio > 4) continue;
    const cents = Math.abs(Math.log2(ratio)) * 1200;
    const bw    = zone.Q * 600;  // bandwidth in cents
    const g     = Math.exp(-Math.pow(cents / bw, 2));
    const r     = g / Math.pow(h, 0.55);
    if (r > best) best = r;
  }
  best *= antiResonanceFactor(zone, driveF);
  return best;
}


// ─── Inter-zone coupling ───────────────────────────────────────
// Each zone slightly raises every neighbor's amplitude based on
// proximity in the body (Euclidean distance in normalized coords).
// Demonstrates the "subtle tuning" case: even sub-threshold
// vibration in one zone biases its neighbors.

export function applyCoupling(rawAmps) {
  const coupled = rawAmps.slice();
  for (let i = 0; i < zones.length; i++) {
    for (let j = 0; j < zones.length; j++) {
      if (i === j) continue;
      const dx = zones[i].nx - zones[j].nx;
      const dy = zones[i].ny - zones[j].ny;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const k  = 0.18 * Math.exp(-Math.pow(d / 0.25, 2));
      coupled[i] += rawAmps[j] * k * 0.4;
    }
    coupled[i] = Math.min(1, coupled[i]);
  }
  return coupled;
}


// ─── Utility: frequency → note name ────────────────────────────

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export function freqToNote(f) {
  if (f <= 0) return '—';
  const n     = 12 * Math.log2(f / 440) + 69;
  const r     = Math.round(n);
  const note  = NOTES[(r % 12 + 12) % 12];
  const oct   = Math.floor(r / 12) - 1;
  const cents = Math.round((n - r) * 100);
  const sign  = cents >= 0 ? '+' : '';
  return `${note}${oct}  ${sign}${cents}¢`;
}


// ─── Utility: hex color → rgba string ──────────────────────────

export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
