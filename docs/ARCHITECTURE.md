# Architecture

This document describes the physics model, rendering pipeline, and key design decisions in The Resonant Singer. It is intended for readers who want to understand or modify the system, or who are evaluating it as an engineering artifact.

---

## 1. System overview

The application is a single-page browser app structured as five ES modules plus a CSS stylesheet. There is no build step; the modules are loaded directly by the browser via `<script type="module">`. The code runs at 60 fps on a single Canvas 2D context.

```
       ┌──────────────┐
       │  index.html  │
       └──────┬───────┘
              │ loads
              ▼
       ┌──────────────┐
       │   main.js    │  Canvas setup, shared state, animation loop
       └──┬─┬─┬─┬─────┘
          │ │ │ │
   ┌──────┘ │ │ └──────────┐
   ▼        ▼ ▼            ▼
┌───────┐ ┌─────────┐ ┌──────────┐
│physics│ │ anatomy │ │ renderer │  (in dep order: physics → anatomy → renderer)
└───────┘ └─────────┘ └──────────┘
   ▲                                  
   │                                  
┌──┴────┐                              
│  ui   │  Slider, buttons, sidebar
└───────┘
```

**Module responsibilities:**

| Module | Owns | Imports |
|--------|------|---------|
| `physics.js` | Zone data, resonance math, coupling, anti-resonance, frequency utilities | (none) |
| `anatomy.js` | Body silhouette, vagus nerve, vocal folds, heart shape, heartbeat | `physics.hexA` |
| `renderer.js` | Zone glows, system aura, anti-resonance visual, badge updates | `physics.hexA`, `anatomy.drawHeartShape` |
| `ui.js` | Slider, presets, anti-buttons, sweep, speed, sidebar bars | `physics.zones`, `physics.freqToNote` |
| `main.js` | Canvas setup, shared state, animation loop orchestration | all of the above |

Dependencies form a DAG with `physics` as the root and `main` as the sink. No circular dependencies.

---

## 2. The physics model

The vocal-cranial resonant system is modeled as 10 coupled oscillators on a 1D frequency axis. Each oscillator has:

- A natural frequency `f₀` (Hz)
- A Q factor (sharpness; higher Q = narrower resonance peak)
- A normalized canvas position (used both for layout and for distance-based coupling)
- An identity / display color

### 2.1 Zone parameters

The 10 zones are listed in [src/physics.js](../src/physics.js) with frequencies hand-tuned to reasonable values for the corresponding anatomical structures:

| Zone | f₀ (Hz) | Q | Notes |
|------|---------|---|-------|
| Chest cavity | 120 | 0.35 | Large volume, low frequency, broad bandwidth |
| Heart | 105 | 0.28 | ~7:8 ratio to chest (close major second) |
| Tracheal column | 180 | 0.45 | 2:3 ratio to chest (perfect fifth) |
| Larynx (driver) | 220 | 0.20 | Sharpest Q — the source itself |
| Pharynx | 300 | 0.50 | ≈4:3 from larynx (perfect fourth) |
| Oral cavity | 420 | 0.55 | ≈ tritone above pharynx |
| Cranial bone | 520 | 0.40 | Lower flank of cranial cluster |
| Nasal / sinuses | 580 | 0.60 | Mid cranial cluster |
| Orbital cavities | 680 | 0.70 | Narrow, sharp |
| Inner ear | 760 | 0.80 | Sharpest cranial resonator |

These are not measured values. They are reasonable hand-tuned defaults that produce a system whose behavior matches a singer's felt experience of where a sustained note "lands" in the body. Anyone wanting clinical accuracy should replace them with values from acoustic impedance measurements — see, e.g., the vocal-tract resonance work of Brad Story and Ingo Titze (verify specific citations against current literature before relying on them).

### 2.2 Resonance response

Each zone's response to a drive frequency `f_d` is computed as:

```
zoneResponse(zone, f_d):
    best = 0
    for h = 1 to 8:
        f_h = f_d * h
        ratio = f_h / zone.f₀
        if ratio < 0.25 or ratio > 4: continue
        cents = |log₂(ratio)| * 1200
        bandwidth = zone.Q * 600        // bandwidth in cents
        g = exp(-(cents / bandwidth)²)  // Gaussian centered on f₀
        r = g / h^0.55                  // higher harmonics weaker
        if r > best: best = r
    return best * antiResonanceFactor(zone, f_d)
```

Key design choices:

- **Operating in cents space** (`log₂(ratio) * 1200`) means the response is musically symmetric — an octave below is treated equivalently to an octave above, and bandwidth scales correctly across the frequency range.
- **Harmonic falloff `h^0.55`** is a hand-tuned compromise between `1/h` (too aggressive, suppresses harmonic stacking) and `1/√h` (too generous, makes every frequency excite every zone weakly).
- **Best-of-harmonics, not sum** — this matches singer phenomenology: a zone "wakes" when the *strongest* harmonic lands on it, rather than accumulating weak contributions.

### 2.3 Inter-zone coupling

Zones lift each other based on physical proximity (Euclidean distance in normalized canvas coordinates):

```
applyCoupling(rawAmps):
    coupled[i] = rawAmps[i]
    for each pair (i, j) where i ≠ j:
        d = euclideanDistance(zone[i], zone[j])
        k = 0.18 * exp(-(d / 0.25)²)
        coupled[i] += rawAmps[j] * k * 0.4
    clamp each coupled[i] to [0, 1]
```

The Gaussian-distance kernel with σ ≈ 0.25 means coupling falls off rapidly past ~30% of canvas width. The coupling coefficient `k * 0.4` keeps the matrix sub-unit-norm so the system doesn't go runaway-positive.

This is the "subtle tuning" mechanism — even when a zone isn't directly excited by a harmonic, it gets a lift from any nearby zone that *is*. Architecturally, it's what turns a list of independent oscillators into a coupled *system*.

### 2.4 Anti-resonance

For each adjacent pair of zones (sorted by natural frequency), the geometric mean `√(f₁ · f₂)` defines an anti-resonance notch frequency. When the drive frequency lands within a narrow band of one of these notches, both members of the pair see their response *suppressed*.

```
For each pair (a, b) of adjacent zones:
    f_notch = √(a.f₀ × b.f₀)
    width   = max(6, (b.f₀ - a.f₀) * 0.13)  // narrow notch in Hz
    depth   = 0.85                            // deep notch
    
antiResonanceFactor(zone, f_d):
    factor = 1.0
    for each notch ar that zone participates in:
        d = |f_d - ar.f_notch|
        if d > ar.width * 3: continue
        dip = ar.depth * exp(-(d / ar.width)²)
        factor *= (1 - dip)
    return factor
```

The full set of anti-resonance notches at the time of writing:

| Notch | f (Hz) | Formula | Pair |
|-------|--------|---------|------|
| NULL | 147 | √(120 × 180) | chest ⇌ tracheal |
| DEAD | 355 | √(300 × 420) | pharynx ⇌ oral |
| COLD | 467 | √(420 × 520) | oral ⇌ skull |
| MUTE | 628 | √(580 × 680) | nasal ⇌ eyes |

### 2.5 System-level states

The animation loop computes two aggregates each frame:

- `sysAmp` — mean amplitude across all zones (proxy for whole-system excitation)
- `activeCount` — number of zones with amplitude > 0.4 (proxy for breadth of excitation)

These drive a five-state badge classifier in `renderer.updateBadge`:

| State | Trigger | Visual |
|-------|---------|--------|
| Off-resonance | otherwise | Dim grey |
| Subtle tuning | sysAmp > 0.15 | Default badge with violet accent |
| Harmonic coupling | sysAmp > 0.35 OR activeCount ≥ 3 | Gold-bordered |
| Whole-system resonance | sysAmp > 0.55 AND activeCount ≥ 5 | Solid gold |
| Anti-resonance | arActive.strength > 0.45 | Violet, overrides others |

Anti-resonance is checked first because phase cancellation is the strongest signal — even when several zones might otherwise be coupling, if the drive sits in a notch, that's the dominant truth of the moment.

---

## 3. The rendering pipeline

Each frame, in order:

1. **Time tracking.** Compute `dt`. Separate `t` (wall clock, drives sweep) from `vt` (visual time = ∑dt·timeScale, drives animation).
2. **Sweep update.** If sweeping, advance `driveF` by `sweepDir × 0.9 × timeScale`.
3. **Physics computation.** Get `raw[]` from zoneResponse, then `amps[]` from applyCoupling. Compute `sysAmp`, `activeCount`, `arActive`.
4. **Canvas fade.** Fill the canvas with semi-transparent background (`rgba(7,9,12,0.32)`). This is what produces the motion-trail effect — old frames decay rather than being instantly cleared.
5. **Layered rendering** (back to front):
   - Body silhouette (faint outline)
   - Whole-system aura (only if sysAmp > 0.35)
   - Vagus nerve + traveling particles
   - Each zone (glow → wave rings → core)
   - Anti-resonance node (if active)
   - Vocal folds (always on top of the larynx zone)
6. **DOM updates.** Sidebar bars + badge.
7. **Request next frame.**

The choice to render in this specific order matters: the system aura must fade *behind* zones so they read as sources of light; the anti-resonance node must draw *over* the affected zones so the cancellation is legible; the vocal folds must be topmost because they are the visual driver and need to be unobscured.

### 3.1 Why Canvas 2D and not WebGL

The system has at most ~50 visual primitives per frame (10 zones × ~5 elements each). Canvas 2D handles this without breaking a sweat. WebGL would add a build step, shader complexity, and a much harder porting story. The art of the project is in the physics and design, not in pushing pixels.

### 3.2 Why no rendering framework

React/Vue/Svelte would force a tree-of-components mental model onto something that's natively a single-canvas instrument. The DOM elements (badge, sidebar, controls) are simple enough that ~30 lines of vanilla JS handle them. Total dependencies in this project: zero npm packages.

---

## 4. State management

The application has a single shared state object in `main.js`:

```javascript
const state = {
  driveF:    220,    // Hz, drives all physics
  t:         0,      // wall-clock time (ms)
  vt:        0,      // visual time (scaled)
  lastT:     0,      // previous wall-clock time
  timeScale: 1,      // 0.25× to 4×
  sweeping:  false,
  sweepDir:  1,
};
```

UI handlers in `ui.js` mutate this object directly. The animation loop in `main.js` reads from it. No reactivity layer is needed because the loop runs at 60 fps anyway — any change is visible within 16ms.

This is deliberately simple. It also means there's no undo/redo, no time-travel debugging, no state snapshotting. For a single-user interactive instrument, none of those are needed.

---

## 5. Known stylizations

The system is honest about where it stylizes physics for visual clarity:

1. **Anti-resonance math.** Real anti-resonance in coupled oscillators arises from complex-amplitude phase computation — the imaginary part of the response goes negative at the notch frequency. This model uses a Gaussian subtraction at the geometric mean of paired zones. The qualitative behavior is correct (response drops below baseline; both paired zones are affected; the notch is narrow), but the math is not phase-derived.

2. **Zone frequencies and Q factors.** Hand-tuned, not measured. The values are in the right neighborhood for the corresponding anatomical structures but should not be cited as biomechanical fact.

3. **Vagus nerve as resonance carrier.** Anatomically, the vagus modulates the system primarily through autonomic tone, not by carrying acoustic vibration. The visual treatment ("particles flow faster when system is excited") is stylized to express coupling, not to model actual nerve function.

4. **Heart resonance.** The heart does respond to chest-cavity acoustic pressure (phonocardiography and cardiac-acoustics research document this) but at a much lower order of magnitude than this model implies. The heart's prominence in the visualization reflects its symbolic and phenomenological importance, not its acoustic engineering significance.

5. **Vocal fold visualization.** Vocal folds vibrate at 100–500 Hz in typical singing — far too fast to render meaningfully at 60 fps. The model clamps the visual flutter to `min(driveF, 14)` so the motion is visible.

These are stylizations, not errors. A more faithful physical model would obscure rather than reveal the system-level resonance behavior the artifact is trying to communicate.

---

## 6. Performance characteristics

Measured on an M1 MacBook Air in Chrome 130:

- **Physics computation per frame:** ~0.04ms (10 zones × 8 harmonics + coupling matrix + 4 anti-resonance checks)
- **Rendering per frame:** ~2.5ms (Canvas 2D, no GPU acceleration)
- **DOM updates per frame:** ~0.3ms (sidebar bars + badge)
- **Total frame time:** ~3ms, well below the 16.6ms budget for 60fps

The artifact runs at full 60 fps on any device with hardware-accelerated Canvas 2D, including phones. Mobile layout collapses the sidebars at <780px width to keep the canvas usable.

---

## 7. Extension points

If you want to fork and extend, these are the cleanest entry points:

- **Add a new zone:** append to the `zones` array in `physics.js`. Re-derive `antiResonances` (it's already automatic). Everything else picks it up. Choose a unique `id` and `color`.
- **Change coupling behavior:** modify `applyCoupling` in `physics.js`. The current model is symmetric Gaussian-distance; you could go directional, sparse, or learned.
- **Add a new view mode:** add per-mode rendering branches in `renderer.js` and a view-state field in `main.js`. The parallel branch's five-mode implementation can serve as a reference.
- **Add audio input:** create `src/audio.js` with an `AnalyserNode` + peak extraction, then have `main.js` poll it each frame and update `state.driveF`. The single-driver case is straightforward; the multi-driver chord case needs a small refactor to allow `driveF` to become `driveFs[]`.
- **Add a journal-noticer aggregator:** outside the artifact; would be a separate backend service. The research document on its architecture lives in the parent project's docs folder.

---

## 8. Why a single-file bundle exists alongside the modular version

`dist/vocal_resonance.html` is functionally identical to the modular version, just inlined. It exists because:

- ES modules cannot be loaded from `file://` due to browser CORS policy; the bundle works everywhere.
- A static file is portable — email it, host it on a free CDN, embed it in another page, ship it on a USB stick.
- The full system in one ~2000-line file is a useful reference: it shows the whole composition without you having to jump between files.

The bundle is the modular code concatenated with module syntax stripped — semantically equivalent, byte-for-byte different. If you modify the modular code, the bundle becomes stale; either edit both or regenerate the bundle.

---

## 9. References and inspirations

- **Acoustic phonetics.** The vocal-tract resonance and source-filter literature, notably the work of Brad Story and Ingo Titze. (Specific paper titles and years should be verified against a current bibliography before citation.)
- **Coupled oscillators.** Strogatz, *Nonlinear Dynamics and Chaos* (2nd ed.), chapters on synchronization and Lyapunov stability.
- **Voice pedagogy.** Miller, *The Structure of Singing*; Doscher, *The Functional Unity of the Singing Voice*. The notion of "placement" — the felt sense of where a sound lands in the body — is central to both.
- **Contemplative epistemology.** The protocol in the accompanying essay draws on bhramari (humming-bee breath) from yoga, on Sufi internal recitation, and on the voice-pedagogy concept of placement. All are explicit lineages, not vague gestures.

The physics is original. The hand-tuned zone parameters were arrived at through iteration against singer phenomenology rather than measurement. The architecture is conventional ES-module separation of concerns with deliberate restraint on dependencies.

---

## 10. Build & deploy notes

- **No build step.** The modular version is served as-is. ES modules require HTTP (not `file://`).
- **No bundler config.** No `webpack.config.js`, no `vite.config.js`, no `package.json` `scripts.build`. The only `package.json` in the project is for the dev server convenience script.
- **Static hosting works.** Vercel, Netlify, GitHub Pages, or `python -m http.server` all serve the project unchanged.
- **CDN deployment.** Drop the entire folder onto any static-asset CDN; nothing requires server-side compute.
- **Embedding.** The whole system can be embedded in another page as an `<iframe>` pointing at `index.html`, or by copying the contents of `dist/vocal_resonance.html` inline.
