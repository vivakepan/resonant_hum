# Interference Mode — Design Document

**Status:** Designed, not implemented. Captures the concept so it isn't lost.

---

## The idea in one sentence

Two wave sources meet inside the body — an **external** source (a song, entering from the skull/ears) and an **internal** source (the hum, rising from the larynx/chest) — counter-propagating, and the interesting physics lives in their **overlap.**

---

## Why it completes the project

Everything built so far is **single-source**: one drive frequency goes in, zones respond. Interference mode introduces a **second source travelling in a different direction**, which moves the subject from *response* to *interference*. This is what lets the artifact finally visualize:

- **Resonance** — the two sources excite the same (or harmonically related) zones; the overlap brightens (constructive).
- **Non-resonance** — the two sources light different zones with little overlap; two separate active regions that don't interact. (Most combinations look like this. That honesty is good.)
- **Harmonizing** — the middle case: hum and song in simple ratio (octave, fifth, third) produce a *stable standing-wave pattern* with fixed bright/dark bands rather than chaotic flicker. The visual signature of consonance.
- **External vs internal effects** — directionality pays off: the song's energy penetrates inward (top-down, attenuating with depth) while the hum radiates outward (bottom-up). Where they meet is the "felt" zone — roughly where singers report *placement.*

Critically, this is **the visualization of the essay's "being sung through" protocol.** Step Two of the practice is: put on a song, hum silently, let the song happen to the body. Interference mode shows exactly that — song in from outside, hum up from inside, body as the medium where they meet. The artifact and the contemplative practice would finally depict the same thing.

---

## The directionality (the clever part)

- **Song** enters from the **skull / ears** (top — the external world coming in).
- **Hum** originates from the **larynx / chest** (the body's own source, going out).
- They **counter-propagate.** Where they meet and how they phase-relate is the visual.

This maps onto real acoustics: counter-propagating waves *do* produce standing-wave patterns with fixed nodes and antinodes. The visualization would illustrate a true phenomenon, not invent one.

---

## Underspecified decision: what does "the song's waves" mean as input?

A song is a dense, time-varying spectrum, not a single frequency. Three handling strategies, increasing fidelity:

1. **Dominant-pitch tracking** *(recommended default)* — extract the strongest frequency each moment (melody/bass), treat as the external drive. Simplest, cleanest, slightly lossy. The song becomes a moving point on the same spectrum the hum lives on.
2. **Multi-peak** — extract top-N spectral peaks (the FFT peak-extraction already prototyped), treat each as a separate external source. Richer, busier, closer to truth.
3. **Full-spectrum field** — the whole FFT magnitude array as a broadband field washing over the body. Most faithful, hardest to make legible, risks looking like noise.

**Recommendation: (1) or (2).** The point of the piece is *legibility* — a singer seeing the relationship between their hum and the song. Full-spectrum is physically richer but visually muddier, and muddiness is the enemy here.

---

## The grift-line caution (load-bearing)

The phrasing "the degree with which the person resonates the song" is where this could tip from phenomenology into pseudoscience. The precise risk: a viewer reads the visualization as **measuring** how much they "resonate with" a song in a mystical/compatibility sense — a frequency-soulmate meter.

The fix is the same discipline that's protected the project throughout: **honesty about what's computed.** The visualization shows what *the model* does given two frequency inputs. It is a stylized acoustic-interference simulation, not a measurement of a person's attunement. The UI must hold this line — *more* firmly as the rendering gets more convincing, not less.

---

## Implementation sketch (when built)

- Add a **second drive source** with a direction vector and a phase relationship to the first.
- Reuse FFT peak-extraction (from the prototyped audio branch) for song input; reuse the existing hum/slider as the internal source.
- The interference computation is small: at each zone (or each point, in a future field version), sum the two sources' contributions with their phase offset; constructive where in-phase, destructive where out-of-phase.
- Rendering: counter-propagating wavefronts meeting in an overlap field — the fun part. In 2D this is two sets of expanding arcs meeting along a contour; in 3D (engine version) it becomes nodal *surfaces.* See [ENGINE_ROADMAP.md](ENGINE_ROADMAP.md).

---

## Scope note

This is a meaningful build, comparable to the audio-input feature itself. Treat it as its own focused session, not folded into other work, so it gets done properly. The 2D version is buildable in the current web artifact and would prove the concept before any engine migration.
