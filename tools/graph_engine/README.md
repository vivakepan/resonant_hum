# Graph Engine — Presence-Engine-Aligned Morphism Layer

This is the **§6 scaffolding** of the Resonant Singer refinement roadmap. It implements, in skeletal form, a relational morphism graph aligned with [Presence Engine v2.2](../../docs/methodology/README.md):

- Typed nodes (zone, band, song, session, event, opening)
- Typed morphisms (causal, structural, temporal, analogical, constitutive, negatory, homological)
- Asynchronous **structural-homology detection** between events/songs (§6.2 / PE L1)
- **Neti-neti elimination test** for surface-similar candidates (§6.3 / PE §7.2)
- Strictly past-tense, strictly passive **articulation surface** (§6.4)

It is **research-scale scaffolding**, not a production service. The components run; browser **EXPORT SESSION** feeds `ingest.py`. See [README.md](../../README.md) (the Critical Analysis & Refinement Roadmap — canonical source of truth) and [docs/VERIFICATION.md](../../docs/VERIFICATION.md).

---

## Hard discipline (read first)

Per §6.4 and AIN-RS-014:

| Rule | Why |
|---|---|
| **No PII, no cloud.** SQLite is local; songs are hashed; sessions are opaque UUIDs. | Matches journal-noticer privacy stance. |
| **Articulation is past-tense only.** `chest+heart co-fired in 14 sessions`, never `try shifting your pitch down 8 Hz`. | The user leads, the system reports. |
| **Every recognition must surface an opening.** If no openings exist, articulation emits nothing. | PE deferred-closure discipline. |
| **Outputs never become inputs to training without an exogenous truth signal.** | Anti-grift guardrail. |
| **Homological morphisms are gated by neti-neti.** Surface-similarity is not enough. | The whole point of the engine. |

---

## Pipeline

```
browser sessions  →  sessions.jsonl  →  ingest.py    → SQLite (graph.db)
                                        homology.py  → homology_candidate
                                        neti_neti.py → morphism (homological) | rejected
                                        articulate.py → articulation.json
                                                        ↓
                                                      browser (optional read-only enrichment of badge tooltip)
```

---

## Quick start

```bash
cd tools/graph_engine

# 1. Build schema + ingest (browser-exported JSONL — schema in ingest.py)
python3 ingest.py path/to/sessions.jsonl

# 2. Detect structural-homology candidates
python3 homology.py

# 3. Pass candidates through the neti-neti elimination test
python3 neti_neti.py

# 4. Emit read-only articulation
python3 articulate.py
```

Inspect with any SQLite browser:

```bash
sqlite3 graph.db "SELECT type, COUNT(*) FROM node GROUP BY type;"
sqlite3 graph.db "SELECT type, COUNT(*), AVG(resonance_depth) FROM morphism GROUP BY type;"
sqlite3 graph.db "SELECT status, COUNT(*) FROM homology_candidate GROUP BY status;"
```

---

## Files

| File | What it does | Maps to §6 |
|------|--------------|------------|
| `schema.sql` | Node + morphism + candidate + articulation tables | §6.1 |
| `ingest.py`  | Reads browser JSONL → typed nodes/morphisms | §6.1 |
| `homology.py`| Async typed-path Jaccard similarity over neighborhoods | §6.2 |
| `neti_neti.py`| Permutation-invariance test: rejects surface-similar matches | §6.3 (the prize) |
| `articulate.py`| Emits read-only `articulation.json` (past-tense, paired openings) | §6.4 |

---

## Session schema (browser ↔ ingest)

Canonical zone order lives in [`zones.py`](zones.py) and must match [`src/physics.js`](../../src/physics.js) `ZONE_IDS` / `zones[].id`.

Each exported session line includes **`events[]`** (required for the graph):

| Field | Meaning |
|-------|---------|
| `t` | Seconds into session |
| `internal_f` | Primary internal driver (Hz) |
| `external_fs` | External song peaks (Hz) |
| `amps` | Ten rendered zone amplitudes, same order as `zones.py` |
| `sysAmp` | Mean zone amplitude |
| `arActive` | Spectral null state or null |

Legacy **`frames[]`** is still emitted for the journal-noticer; ingest will not build morphisms from frames that lack `amps`.

**Smoke test:** `python3 tools/graph_engine/verify_ingest_schema.py`

## What this scaffolding does NOT do (yet)

- **Anti-grift verification harness:** §9 controlled-construction test (chest-only homology rejection) is not automated yet.
- **Tuning of τ, depth, COLLAPSE_TOL.** Placeholders until a calibrated synthetic corpus exists.

---

## Verification (per §9)

Before relying on this engine for any articulation:

1. **Synthesize 30 sessions each of three "resonant" archetypes and three "non-resonant" archetypes.** Adapt [tools/synthetic_sessions/generate.py](../synthetic_sessions/generate.py) to emit the JSONL schema in `ingest.py`.
2. **Ingest and run homology.py.** Expectation: ≥ 1 within-archetype candidate per "resonant" group; **zero** cross-archetype candidates between resonant and non-resonant.
3. **Run neti_neti.py.** Expectation: candidates driven solely by shared chest dominance get `rejected_neti_neti` with reason `"collapsed under permutation — shared zone identity drove the match"`.
4. **Run articulate.py.** Expectation: every emitted item has a paired opening; empty output is acceptable.

Failure of step 2 means `SIMILARITY_TAU` is too loose. Failure of step 3 means the permutation isn't being applied correctly, or `COLLAPSE_TOL` is too forgiving — the elimination test is the heart of the engine and must be rigorous.

---

## Mapping back to Presence Engine v2.2

| PE v2.2 concept | Where it lives here |
|---|---|
| L1 asynchronous homology engine | `homology.py` |
| L2 morphism graph (typed nodes/edges, deferred closure) | `schema.sql` + `ingest.py` |
| L3 articulation surface (recognition + revealed opening) | `articulate.py` |
| §7.2 neti-neti elimination | `neti_neti.py` |
| Bootstrap from mathematical anchors | The constitutive morphisms (geometric-mean anti-resonance pairs) seeded by the existing physics |
| Epistemic warrant ladder | The `warrant` column on `morphism` |
| Resonance Depth | The `resonance_depth` column on `morphism` |
| Temporal Weight Vector | `first_seen` + `last_seen` columns |
| Openness Flag | `is_open` column + the explicit `opening` node type |

This is the smallest possible faithful instance of the parent program on a bounded, testable domain.
