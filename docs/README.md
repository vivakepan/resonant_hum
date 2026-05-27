# Documentation index

Start at the [project README](../README.md) for scope, quick start, and offline pipelines. Use this page to choose the right deep-dive.

**Status legend**

| Tag | Meaning |
|-----|---------|
| **SHIPPED** | Matches current `src/` or `tools/` |
| **PARTIAL** | Scaffold or simplified vs full design |
| **STAGED** | In-project next tier; not in the browser build |

---

## By component

| Component | Doc | Code |
|-----------|-----|------|
| Browser instrument (overview) | [ARCHITECTURE.md](ARCHITECTURE.md) | `src/` · `index.html` |
| Terminology (resonance senses, dual anti-resonance) | [GLOSSARY.md](GLOSSARY.md) | — |
| Verification checklist | [VERIFICATION.md](VERIFICATION.md) | — |
| Two-source interference field | [INTERFERENCE_MODE_DESIGN.md](INTERFERENCE_MODE_DESIGN.md) | `src/field.js` |
| Mic + file audio | [AUDIO_PIPELINE_DESIGN.md](AUDIO_PIPELINE_DESIGN.md) | `src/audio.js` |
| Relational graph (homology, neti-neti) | [../tools/graph_engine/README.md](../tools/graph_engine/README.md) | `tools/graph_engine/` |
| Synthetic ML loop | [../tools/synthetic_sessions/README.md](../tools/synthetic_sessions/README.md) | `tools/synthetic_sessions/` |
| Journal-noticer | [JOURNAL_NOTICER_DESIGN.md](JOURNAL_NOTICER_DESIGN.md) | `tools/journal_noticer/` |
| Engine tier (3D / UE5) | [ENGINE_ROADMAP.md](ENGINE_ROADMAP.md) | — |
| Methodology registries | [methodology/README.md](methodology/README.md) | `docs/methodology/` |
| Essay / practice framing | [essay-draft.md](essay-draft.md) | — |
| Vibrational system (standalone) | [vibrational-system.md](vibrational-system.md) | — |

---

## Reading order

1. [../README.md](../README.md) — what the full system is  
2. [essay-draft.md](essay-draft.md) — practice, protocol, what it is not  
3. [vibrational-system.md](vibrational-system.md) — optional deep dive (diagrams, coupling, interference)  
4. [ARCHITECTURE.md](ARCHITECTURE.md) — how the browser app works (code-true)  
5. Design docs (`*_DESIGN.md`) — *why* choices were made; each links to implementation  
6. [methodology/](methodology/) — what remains unknown (AINs, assumptions)  
7. `tools/*/README.md` — how to run offline pipelines  

When code changes, update **ARCHITECTURE.md** and any affected design doc **Status** line.
