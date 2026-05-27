/**
 * ui.js — Interactive controls and sidebar
 *
 * Wires up the frequency slider, preset buttons, anti-resonance buttons,
 * sweep toggle, speed multiplier, and the sidebar zone bars.
 * Calls back into the state object in main.js via a setState callback.
 */

import { zones, freqToNote } from './physics.js';


// ─── Sidebar zone bars ─────────────────────────────────────────

export function createZoneBars() {
  const container = document.getElementById('zones');
  return zones.map(z => {
    const row = document.createElement('div');
    row.className = 'zone-row';
    row.innerHTML = `
      <span class="dot" style="background:${z.color};color:${z.color}"></span>
      <div>
        <div style="color:${z.color};font-size:10px;letter-spacing:0.05em;">${z.name}</div>
        <div class="bar-cell"><div class="bar-fill" style="color:${z.color};width:0%"></div></div>
      </div>
      <div class="pct">0%</div>`;
    container.appendChild(row);
    return {
      fill: row.querySelector('.bar-fill'),
      pct:  row.querySelector('.pct'),
    };
  });
}

export function updateZoneBars(rowEls, amps) {
  zones.forEach((z, i) => {
    rowEls[i].fill.style.width = (amps[i] * 100).toFixed(0) + '%';
    rowEls[i].pct.textContent  = (amps[i] * 100).toFixed(0) + '%';
  });
}


// ─── Control wiring ────────────────────────────────────────────
// Takes a `state` object with: driveF, sweeping, sweepDir, timeScale.
// Mutates it directly (simple shared state for a single-page app).

export function wireControls(state) {
  const freqInput = document.getElementById('freq');
  const freqVal   = document.getElementById('freqVal');
  const noteName  = document.getElementById('noteName');

  function clearAllActive() {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.anti-btn').forEach(b => b.classList.remove('active'));
  }

  function setDrive(f, activeBtn) {
    state.driveF = f;
    freqInput.value = f;
    freqVal.textContent = f.toFixed ? f.toFixed(1) : f;
    noteName.textContent = freqToNote(f);
    clearAllActive();
    if (activeBtn) activeBtn.classList.add('active');
  }

  // Slider
  freqInput.addEventListener('input', e => {
    setDrive(parseFloat(e.target.value), null);
  });

  // Preset buttons (resonance peaks)
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setDrive(parseFloat(btn.dataset.f), btn);
    });
  });

  // Anti-resonance buttons (dead zones + notches)
  document.querySelectorAll('.anti-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setDrive(parseFloat(btn.dataset.f), btn);
    });
  });

  // Sweep toggle
  const sweepBtn = document.getElementById('sweep');
  sweepBtn.addEventListener('click', () => {
    state.sweeping = !state.sweeping;
    sweepBtn.classList.toggle('on', state.sweeping);
    sweepBtn.textContent = state.sweeping ? 'STOP SWEEP' : 'SWEEP';
  });

  // Speed multiplier (visualization timing only)
  const speedStops = [0.25, 0.5, 1, 2, 4];
  let speedIdx = 2;
  const speedBtn = document.getElementById('speed');
  speedBtn.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speedStops.length;
    state.timeScale = speedStops[speedIdx];
    speedBtn.innerHTML = `<span class="lbl">RATE</span>${state.timeScale}×`;
  });

  // Initialize note display
  noteName.textContent = freqToNote(state.driveF);

  // Return a handle for the sweep update (called each frame)
  return {
    updateSweepDisplay() {
      freqInput.value = state.driveF;
      freqVal.textContent = state.driveF.toFixed(1);
      noteName.textContent = freqToNote(state.driveF);
    }
  };
}
