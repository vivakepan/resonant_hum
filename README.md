# The Resonant Singer

> A visual tuner — for resonance, not pitch.

An interactive study in coupled oscillators, rendered on a body silhouette. Drag the slider through 70–900 Hz and watch which parts of the vocal-cranial system light up. Some frequencies wake the whole body. Some land in dead zones. A few — the ◊-marked ones — sit in *anti-resonance* notches, where two zones interfere out-of-phase and cancel each other below baseline.

The project is a small instrument and a research artifact in roughly equal measure: a working physics simulation of the resonant system that produces human singing, and the seed of a longer phenomenological investigation into what voice pedagogy calls *placement* — the felt sense of a sound vibrating inside a body that contains it.

---

## What's actually in here

A deterministic coupled-oscillator simulation across 10 anatomical resonant zones (chest, heart, tracheal column, larynx, pharynx, oral cavity, nasal sinuses, cranial bone, orbital cavities, inner ear), each with its own natural frequency and Q factor, computing:

- **Harmonic response** — each zone's response to the drive frequency *and* harmonics h=1..8, with amplitude falloff h^0.55
- **Inter-zone coupling** — Gaussian-distance-weighted amplitude transfer between zones (the "subtle tuning" case where one excited zone lifts its neighbors)
- **Anti-resonance notches** — at the geometric mean √(f₁·f₂) of each adjacent zone pair, where coupled oscillators cancel destructively
- **System-wide states** — off-resonance → subtle tuning → harmonic coupling → whole-system resonance → anti-resonance (phase cancellation), each with its own visual cue

The rendering layer runs on a Canvas 2D animation loop at 60 fps with motion trails, expanding wave rings, a vagus-nerve particle system, an independent ~1 Hz heartbeat that overlays the heart-zone's resonance amplitude, and a vocal-fold flutter slowed for visibility. A speed multiplier (0.25×–4×) scales visualization timings without touching the physics.

---

## Quick start

The project uses ES modules and needs to be served over HTTP (browsers block module imports from `file://`).

**Option 1 — Python (no install needed on most systems):**
```bash
cd resonant-singer
python3 -m http.server 8000
# Open http://localhost:8000
```

**Option 2 — Node:**
```bash
cd resonant-singer
npx http-server -p 8000
# Open http://localhost:8000
```

**Option 3 — Portable single-file version** (works directly from `file://`, no server):
Open `dist/vocal_resonance.html` in any modern browser by double-clicking it. This is the bundled monolithic version, identical in behavior to the modular code.

---

## Try this

1. Click **A3 · 220** — the larynx peaks at exactly its natural frequency. Clean baseline.
2. Click **SWEET · 262** (middle C) — no zone peaks directly, but harmonics stack: 262×2 ≈ 524 (skull), 262÷2 ≈ 131 (chest). This is the "ringing through everything" state singers describe.
3. Click **◊ DEAD · 355** — geometric mean of pharynx (300) × mouth (420). A violet anti-resonance node draws between those two zones; both bars *drop below* off-resonance baseline.
4. Click **SWEEP**, then **RATE → 0.25×** — crawl through the spectrum. Watch peaks, valleys, and anti-resonance notches resolve in sequence.
5. Click **♥ HEART · 105** — heart resonates at its center; chest lifts via proximity coupling; the heart shape's lub-dub rhythm overlays its resonance amplitude.

---

## Project structure

```
resonant-singer/
├── index.html              Entry point
├── styles/
│   └── main.css           All visual styling
├── src/
│   ├── physics.js         Zone data, resonance math, coupling, anti-resonance
│   ├── anatomy.js         Body silhouette, vagus nerve, vocal folds, heart
│   ├── renderer.js        Zone glows, aura, anti-resonance visual, badge
│   ├── ui.js              Slider, presets, buttons, sweep, speed, sidebar
│   └── main.js            Canvas, state, animation loop, glue
├── docs/
│   ├── ARCHITECTURE.md    Technical deep-dive
│   └── essay-draft.md     The accompanying essay
└── dist/
    └── vocal_resonance.html   Portable single-file build
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the technical deep-dive on the physics model, rendering pipeline, and design decisions.

---

## The physics, in one paragraph

The vocal tract is a chain of coupled cavities driven by the buzz of the vocal folds. Each cavity has a natural resonant frequency that depends on its volume, opening size, and tissue compliance. When the fundamental of the driving signal — or one of its lower harmonics — lands near a cavity's natural frequency, that cavity *resonates*: the airwave inside it amplifies, the surrounding tissue vibrates, and a singer feels the sound "place" itself there. The model implemented here is a simplified, stylized version of this: ten zones with hand-tuned natural frequencies (chest ≈ 120 Hz through inner ear ≈ 760 Hz), Gaussian response curves around each frequency parameterized by Q, harmonic stacking up to the 8th, and an explicit coupling matrix that lets neighboring zones lift each other through sub-threshold vibration. The anti-resonance notches at the geometric mean of adjacent zones are stylizations of a real phenomenon — destructive interference between coupled oscillators — though the underlying math uses Gaussian subtraction rather than complex-amplitude phase computation. This is acknowledged honestly in the [architecture doc](docs/ARCHITECTURE.md#known-stylizations).

---

## Why it exists

The artifact began as a single visual aid for an essay on focal fry and vocal resonance, and grew through iterative refinement into a small instrument. It's deliberately tiered:

- **Floor case:** open it, drag the slider, enjoy the visuals over a song. No knowledge required.
- **Middle case:** read the panel descriptions, try the protocols, learn what *placement* means by watching it.
- **Deep case:** read the architecture doc, fork the code, build on the physics, contest the model.

The accompanying essay ([docs/essay-draft.md](docs/essay-draft.md)) lays out a two-step contemplative practice — silent hum, then "being sung through" by music — that uses the artifact as a visual reference for what the body might be doing. It is not a frequency-healing claim. It is closer to phenomenology: notice what you notice, judgment suspended.

---

## What this project demonstrates (engineering)

- Signal processing: harmonic stacking, response curves in cents space, Gaussian bandwidth modeling
- Physics modeling: coupled oscillators, resonance and anti-resonance, distance-weighted coupling
- Canvas 2D animation: motion trails, multi-pass rendering, radial gradients, additive glow
- ES module architecture: clean separation of physics, anatomy, rendering, and UI concerns
- State management without a framework: ~50 lines of shared state, no reactivity library
- Responsive design: full layout above 780px, graceful collapse on mobile

The single-file `dist/vocal_resonance.html` exists for portability and demonstrates that the entire system can be served as a static asset with zero build pipeline.

---

## What this project does *not* demonstrate

It's worth being clear about scope:

- **Not** a clinically accurate biomechanical model of the vocal tract. The zone frequencies and Q factors are reasonable but hand-tuned, not derived from MRI or impedance measurements.
- **Not** a phase-derived anti-resonance model. The notches use Gaussian subtraction at the geometric mean; the qualitative behavior is faithful but the math is stylized.
- **Not** a frequency-healing or wellness-grift project. The essay explicitly distinguishes itself from that genre.
- **Not** a finished publication. The essay is a first-draft, the journal-noticer architecture is sketched but unbuilt, and the audio-input pipeline that exists in some development branches is not in this shipping version.

If you want any of those things, the [architecture doc](docs/ARCHITECTURE.md) discusses what would need to change to get there.

---

## Roadmap

Things that exist in design but not yet in this build:

- **Web Audio mic + file input** — driving the visualization from a live FFT of the user's voice or an audio file. Prototyped separately; not yet merged into this build.
- **Multi-driver (chord stacking)** — pin multiple drive frequencies and watch them combine. Prototyped separately; not yet merged into this build.
- **Environmental interference** — broadband noise floors (HVAC, traffic, mains hum) that lift baseline response. Prototyped separately; not yet merged into this build.
- **Five view modes** — Organs / Flow / Nerves / Solid / EM, the same physics seen through different visual stances. Prototyped separately; not yet merged into this build.
- **Interference mode** — a song source and a hum source counter-propagating through the body, visualizing constructive/destructive overlap. Designed (see [docs/INTERFERENCE_MODE_DESIGN.md](docs/INTERFERENCE_MODE_DESIGN.md)); not yet implemented.
- **Journal-noticer** — a small public-aggregator agent that watches opt-in session data and writes weekly journal entries describing what patterns it sees, including when it sees nothing. Architecture researched and documented (see [docs/JOURNAL_NOTICER_DESIGN.md](docs/JOURNAL_NOTICER_DESIGN.md)); not yet implemented.
- **Synthetic-session generator** — Python script that walks through the physics on simulated frequency trajectories and produces labeled session traces for ML training. Implemented; see [tools/synthetic_sessions/](tools/synthetic_sessions/).
- **Game-engine version** — a 3D / volumetric / embodied version for deeper experimentation. Staged capability map in [docs/ENGINE_ROADMAP.md](docs/ENGINE_ROADMAP.md). Future drafts.

Each of these is a clean addition to the current architecture rather than a rewrite.

---

## License

MIT.

---

## Credit

Built by Vivake Pandey. Physics, design, and code all original. The methodology underlying the development process is documented separately as part of a longer research program; see the accompanying essay for the conceptual frame.
