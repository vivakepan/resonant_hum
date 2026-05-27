# The Resonant Singer

> A visual tuner — for resonance, not pitch.

An interactive study in **coupled oscillators**, rendered on a body silhouette. Drag the slider through 70–900 Hz, hum into the mic, or load a song — and watch how internal hum and external pitch meet inside the form. Some frequencies wake the whole body. Some land in dead zones. **Spectral nulls** (◊-marked presets) suppress paired zones below baseline; with two active sources, the **interference field** adds **spatial nodes** where waves cancel in space.

The project is **half instrument, half research system**: a browser physics simulation of vocal-cranial resonance phenomenology, plus offline tooling (relational graph, synthetic ML, journal-noticer) and living **Methodology v1.2** registries. It is **not** a clinical model, wellness product, or recommendation engine.

Parent research program: [Methodology v1.2](docs/methodology/README.md) · Presence Engine v2.2 (relational morphism graph, deferred closure, neti-neti elimination).

---

## Project scope (complete system)

| Layer | Component | Location |
|-------|-----------|----------|
| **Browser instrument** | Zone physics, coupling, dual anti-resonance, field, breath, audio (mic + file), five view modes, environmental interference, multi-driver | `src/` · `index.html` |
| **Portable build** | Single-file bundle for `file://` use | `dist/vocal_resonance.html` (rebuild from `src/` when releasing) |
| **Relational graph** | Ingest → homology → neti-neti → passive articulation | `tools/graph_engine/` |
| **Controlled ML** | Synthetic sessions from known physics; feature vs CNN lesson | `tools/synthetic_sessions/` |
| **Journal-noticer** | Fixed-pipeline weekly aggregate reports (nulls first-class) | `tools/journal_noticer/` · [design](docs/JOURNAL_NOTICER_DESIGN.md) |
| **Methodology** | Assumptions, AINs, isomorphic mappings | `docs/methodology/` |
| **Engine tier** | Staged 3D / MetaSounds / spatial audio capability map | [docs/ENGINE_ROADMAP.md](docs/ENGINE_ROADMAP.md) |
| **v1 reference** | Earlier monolithic shipped draft (mic-heavy UX parity source) | See [Versions](#versions-v1--v2) |

---

## What's in the browser

### Physics (three composed layers)

1. **Zones** — Ten anatomical resonators with harmonic stacking in cents space (h = 1…8, falloff h^0.55), **anatomical adjacency coupling**, multi-modal cavities (chest, skull) with per-mode `evidence` fields, and four **spectral null** notches at geometric means between adjacent pairs.
2. **Field** — Two-source wave superposition: internal source at the **larynx**, external peaks from uploaded audio at **skull-top** (*visualization geometry, not anatomy*). Zones sample the field; external balance at zero collapses the field to a no-op.
3. **Breath** — Synthesized envelope (default), tap-to-breathe (spacebar), or mic-derived RMS modulation. Modulates internal amplitude, vagus flow, aura, and chest sway.

### Time and drivers

- `drivers[]` model: internal slider (or **mic pitch** via on-device FFT), pinned chord stacks (**MULTI**), external song peaks (K = 1…5), environmental presets (**ENV**).
- Per-zone first-order envelopes (Q-dependent attack/decay).

### Recognition stances (five view modes)

Same physics, different visual weighting: **Organs** · **Flow** · **Nerves** · **Solid** · **EM**. Canvas strip below the silhouette; caption updates per stance.

### Audio (on-device only)

- **LISTEN · MIC** — `getUserMedia` with analysis-friendly constraints; dominant peak drives the internal source. No raw audio transmitted.
- **Song panel** — File upload → FFT peaks → external drivers + optional **FIELD** overlay.
- Design rationale: [docs/AUDIO_PIPELINE_DESIGN.md](docs/AUDIO_PIPELINE_DESIGN.md) (hand DSP for hum; ML held in reserve).

### Rendering

Canvas 2D @ 60 fps — motion trails, clipped additive interference layer, vagus particles, heartbeat overlay, vocal-fold flutter, system badge. Speed **RATE** 0.25×–4× scales visualization only.

### Research hooks (browser)

- **EXPORT SESSION** — Opt-in JSONL for `tools/graph_engine/ingest.py` and `tools/journal_noticer/`.
- Optional **`articulation.json`** — Passive badge tooltip enrichment from `tools/graph_engine/articulate.py` ([`src/articulation.js`](src/articulation.js)).

---

## Quick start

```bash
cd resonant-singer
python3 -m http.server 8000
# open http://localhost:8000
```

Or: `npm start`

**Portable:** `npm run build:dist` → open `dist/vocal_resonance.html` for `file://` without a server. Run `npm run verify` first.

---

## Try this

1. **A3 · 220** — larynx fundamental baseline.
2. **SWEET · 262** — harmonic stacking (chest + skull without a peak at 262 Hz).
3. **◊ DEAD · 355** — spectral null between pharynx and mouth.
4. **LISTEN · MIC** — hum; watch the internal driver track pitch.
5. Load a song → **PLAY** → tune **EXT BAL** and **FIELD** — spatial interference structure.
6. **MULTI** + two presets — chord-style multi-driver stacking.
7. **ENV** — cycle mains / HVAC / traffic interference floors.
8. Switch **view modes** (Organs → Flow → Nerves …).
9. **EXPORT SESSION** → run the offline pipelines below.

---

## Offline pipelines

### Relational graph (Presence-Engine-aligned)

```bash
cd tools/graph_engine
python3 ingest.py path/to/sessions.jsonl
python3 homology.py
python3 neti_neti.py
python3 articulate.py   # → articulation.json for the browser
```

Rules: no PII, no cloud, past-tense articulation only, homological morphisms gated by neti-neti. See [tools/graph_engine/README.md](tools/graph_engine/README.md).

### Synthetic sessions (controlled ML)

```bash
cd tools/synthetic_sessions
python3 generate.py -n 4000 --balance -o sessions_balanced.jsonl
python3 train.py --data sessions_balanced.jsonl
```

If you change `src/physics.js`, update `physics.py`. See [tools/synthetic_sessions/README.md](tools/synthetic_sessions/README.md).

### Journal-noticer

```bash
cd tools/journal_noticer
python3 noticer.py --sessions path/to/sessions.jsonl --out journal/
```

Fixed analysis — **no training on user behavior**. See [docs/JOURNAL_NOTICER_DESIGN.md](docs/JOURNAL_NOTICER_DESIGN.md).

---

## Project structure

```
resonant-singer/
├── index.html
├── styles/main.css
├── src/
│   ├── physics.js          Zones, modes, adjacency, spectral nulls, drivers[]
│   ├── field.js            Two-source interference grid
│   ├── audio.js            Mic + file FFT peaks
│   ├── breath.js           Breath envelope (synth / tap / mic)
│   ├── views.js            Five recognition stances
│   ├── env.js              Environmental interference presets
│   ├── sessions.js         Opt-in session export
│   ├── articulation.js     Passive badge enrichment
│   ├── anatomy.js · renderer.js · ui.js · main.js
├── docs/
│   ├── README.md              Documentation index
│   ├── ARCHITECTURE.md
│   ├── GLOSSARY.md · VERIFICATION.md
│   ├── AUDIO_PIPELINE_DESIGN.md
│   ├── INTERFERENCE_MODE_DESIGN.md
│   ├── JOURNAL_NOTICER_DESIGN.md
│   ├── ENGINE_ROADMAP.md
│   ├── essay-draft.md
│   ├── vibrational-system.md
│   └── methodology/
├── tools/
│   ├── synthetic_sessions/
│   ├── graph_engine/
│   └── journal_noticer/
└── dist/vocal_resonance.html
```

Documentation index: [docs/README.md](docs/README.md) · Technical deep-dive: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Versions: v1 → v2

| | **v1** (first shipped monolith) | **v2** (this repository) |
|---|--------------------------------|----------------------------|
| Delivery | Single `vocal_resonance.html` | ES modules + Python tools + methodology |
| Physics | Pixel-distance coupling | Anatomical adjacency graph, multi-modal zones |
| Anti-resonance | Spectral notches | Spectral nulls + spatial field nodes |
| Audio | Mic + file + multi-peak | Mic + file + field + breath (integrated) |
| ML / aggregate | — | Graph engine, synthetic sessions, journal-noticer |
| Discipline | — | Living AIN / assumption registries |

v1 remains a valid reference for exploratory UX; v2 is the formal research instrument.

---

## Verification

| Check | Validates |
|-------|-----------|
| `train.py` ±2 pp after physics edits | Generative labels stable |
| Sustained preset → zone envelope plateau | AIN-RS-006 envelopes |
| Sine WAV + internal harmonic → field beats | Wave summation |
| Neti-neti controlled-construction test | Rejects chest-only homology |
| Breath on → vagus/aura/chest at breath period | Breath layer |

Dev console: `window.__rs` → `{ state, audio, zones }`.

---

## What this demonstrates

- Signal processing, coupled oscillators, Canvas 2D systems design
- On-device audio analysis with explicit privacy boundaries
- Relational ML alternative to behavioral training (graph + neti-neti + passive articulation)
- Methodology v1.2 operational discipline (assumptions, falsification, active ignorance)
- Staged engine roadmap for deeper embodiment ([ENGINE_ROADMAP](docs/ENGINE_ROADMAP.md))

## What this is not

- Clinically validated biomechanics or phase-exact anti-resonance math
- A frequency-healing or wellness-grift product
- An LLM coach or recommender (articulation and journal are **past-tense reporters**)

---

## Tiered audience

- **Floor:** slider, mic, or song — no reading required.
- **Middle:** panels, ◊ presets, view modes — learn *placement* visually.
- **Deep:** architecture, methodology, fork physics, run graph + synthetic + noticer pipelines.

Essay: [docs/essay-draft.md](docs/essay-draft.md) · Vibrational system (standalone): [docs/vibrational-system.md](docs/vibrational-system.md).

---

## License

MIT.

---

## Credit

Built by **Vivake Pandey**. Physics, visualization, methodology registries, and tooling are original. Structural discipline inherits from Methodology v1.2 and Presence Engine v2.2.
