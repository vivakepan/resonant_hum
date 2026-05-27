# Synthetic Session Generator + Training Scaffold

A self-contained ML learning project built on the Resonant Singer physics. It generates labeled synthetic user-sessions from the *same* coupled-oscillator model the artifact renders, then trains a model to predict a behavioral label from the session trace.

The point is **not** the accuracy number. The point is an end-to-end ML loop on data whose generative process you fully control — which is the cleanest possible setup for learning, because you can verify whether the model recovers the structure you put in.

---

## Files

| File | What it does |
|------|--------------|
| `physics.py` | Python port of `src/physics.js`. Single source of physics truth for the Python side. Verified to match the JS reference output exactly. |
| `generate.py` | Simulates users exploring the spectrum in four styles, runs each visited frequency through the physics, and labels each session. Outputs JSONL. |
| `train.py` | Trains a classifier on the sessions. TensorFlow 1D-CNN over raw trajectories if TF is installed; dependency-free numpy logistic regression on summary features otherwise. |

---

## Quick start

```bash
cd tools/synthetic_sessions

# Generate data (unbalanced — realistic class distribution)
python3 generate.py -n 4000 -o sessions.jsonl

# Or balanced 50/50 for clean training
python3 generate.py -n 4000 --balance -o sessions_balanced.jsonl

# Train (auto-detects TensorFlow; falls back to numpy)
python3 train.py --data sessions_balanced.jsonl

# Force a backend
python3 train.py --data sessions_balanced.jsonl --backend numpy
python3 train.py --data sessions_balanced.jsonl --backend tf   # needs: pip install tensorflow
```

---

## The label (project decision 1b)

**Did the session find a NON-OBVIOUS coupling / anti-resonance state?**

"Non-obvious" is defined operationally: a state *not* reachable by simply clicking a preset button. Concretely, the label is 1 if the session either:

- (a) hit a **strong coupling** state (sysAmp ≥ 0.45 AND ≥ 5 active zones) at an **off-preset** frequency — genuine discovery, not a preset click, OR
- (b) **lingered** in an anti-resonance node (strength ≥ 0.55 on ≥ 2 visits).

Both require exploring the spaces *between* the preset buttons. This label is interesting precisely because it separates users who only clicked the obvious presets from users who explored — which is the behavior the project actually cares about surfacing.

### Why not "reached whole-system resonance"?

Whole-system resonance is reachable by clicking SWEET or A3 — it's handed to the user. Non-obvious discovery requires genuine exploration. The label measures *behavior that exceeds what the UI prescribed*, not *whether the user found the thing we pointed at.*

---

## The calibration story (an honest methodology note)

The first version of the label used a loose coupling bar (sysAmp ≥ 0.35 OR ≥ 3 active zones). It produced a **98.5% positive rate** — useless for training.

Diagnosis (run the diagnostic in `physics.py`'s spirit): across the 70–900 Hz spectrum, that loose bar is satisfied by **66% of all frequencies**. With sessions of 8–60 steps, virtually every session stumbles into one. The label wasn't measuring exploration; it was measuring "did you visit almost any frequency."

The discriminating states turned out to be much rarer:
- strong coupling (sysAmp ≥ 0.45 AND ≥ 5 active): ~2% of the spectrum
- anti-resonance (strength ≥ 0.55): ~17% of the spectrum

Rebuilding the label around these, plus shortening sessions to a realistic length (exponential, mean ~12 steps) and making "dwellers" actually linger, brought the positive rate to **62.8%** unbalanced — a genuinely learnable distribution. The `--balance` flag resamples to 50/50.

This calibration episode is the project methodology in miniature: the first label *worked logically* (it computed what it claimed to) but was *misaligned* (it pointed at the wrong thing). The fix wasn't better training — it was enriching the problem description until the label discriminated. The saturated-label finding was a data point, not a failure.

---

## What the models found (results)

On the balanced dataset (~2,970 sessions, 50/50):

| Model | Input | Test accuracy | Majority baseline |
|-------|-------|---------------|-------------------|
| numpy logistic regression | 6 summary features | **0.87** | 0.48 |
| TensorFlow 1D-CNN | raw frequency trajectory | **0.76** | 0.48 |

Both beat the baseline substantially. The interesting result is that the **summary-feature model beats the raw-trajectory CNN.**

The logistic regression's learned weights make the reason legible:
```
max_sysamp     -0.49
max_active      0.26
max_ar          3.66   <- dominant
coupling_frac   0.30
antires_frac    3.47   <- dominant
len             1.86
```
The two anti-resonance features carry most of the signal, which is correct — anti-resonance visits are the strongest component of the label by construction.

**The lesson** (the one the project's parent methodology says nobody can teach you except by doing): clean hand-engineered features that align with the label's true structure beat a model forced to extract that structure from raw sequences, *especially at small data scale.* The CNN has to learn "where the interesting frequencies are" from scratch; the summary features hand it the answer. With far more data the CNN would likely close the gap — and confirming or refuting that is itself a good next exercise.

This is exactly why the recommended learning sequence is: synthetic data first (clean labels, known generative process), then real data later (messy labels, unknown process). The gap between those two is the actual content of ML engineering.

---

## Exploration styles (the four simulated users)

| Style | Behavior | Positive rate | Why |
|-------|----------|---------------|-----|
| `dweller` | Picks 1–2 points, barely moves | ~35% | Lingers, often misses the interesting spaces |
| `random_walk` | Brownian wander | ~56% | Genuine exploration |
| `sweeper` | Smooth sweep across spectrum | ~69% | Crosses everything, including notches |
| `preset_hopper` | Jumps between preset/anti buttons | ~89% | Anti-buttons *are* anti-resonance states |

These rates are a sanity check: they match the intuition of how each style relates to discovery. If they ever invert, something broke in the physics or label.

---

## Extending this

- **More data → does the CNN close the gap?** Generate 50k sessions and re-train. If the CNN catches the summary model, raw-sequence learning scales; if not, the features are fundamentally more efficient here.
- **Harder label** — predict *which* anti-resonance node was found, turning this into multi-class.
- **Sequence-order sensitivity** — does *when* in the session the discovery happened matter? Add positional features.
- **Real data** — when the artifact ships with opt-in telemetry, the session schema here is designed to match what the journal-noticer would collect (see `docs/JOURNAL_NOTICER_DESIGN.md`). Swap synthetic for real and re-run; the gap between the two is the lesson.

---

*If you change `src/physics.js`, change `physics.py` to match. The two must stay in sync or the synthetic labels stop reflecting the artifact.*
