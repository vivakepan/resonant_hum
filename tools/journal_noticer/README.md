# Journal-Noticer

**Status:** PARTIAL SHIPPED · [README.md](../../README.md)

Weekly **honest aggregate reporting** over opt-in Resonant Singer session exports. Implements the architecture in [docs/JOURNAL_NOTICER_DESIGN.md](../../docs/JOURNAL_NOTICER_DESIGN.md).

## Principles

- Fixed analysis pipeline — **no training on user behavior**
- Clip-bounded sufficient statistics; sessions deletable by id
- Three outputs: publish finding · publish nothing · request hiatus
- Holdout bucket for performative-prediction checks (when enabled in config)

## Quick start

```bash
cd tools/journal_noticer
python3 noticer.py --sessions ../graph_engine/test_sessions.jsonl --out journal/
```

Produces dated markdown entries under `journal/` suitable for a public corpus.

## Inputs

Browser-exported `sessions.jsonl` (see [src/sessions.js](../../src/sessions.js)). Only scalar features — no raw audio, no invertible embeddings.

## Related

- [tools/graph_engine/](../graph_engine/) — relational morphism graph (homology, neti-neti, articulation)
- [docs/methodology/](../../docs/methodology/) — assumptions and active ignorance registries
