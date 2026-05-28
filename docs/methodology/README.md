# Methodology Registries

These files implement the **Isomorphic Enrichment, Alignment Tracking, and Active Ignorance Registry** discipline from the parent methodology document (Methodology v1.2) for the Resonant Singer project. They are *living* artifacts: any non-trivial change to the system should add to or amend them.

**Project docs:** [README.md](../README.md) · [docs index](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md)

---

## Why these files exist

The parent methodology rests on four assumptions:

1. **Truth is alignment between problem and solution.** When something fails, the *problem description* is incomplete — not the solution.
2. **Illogical relationships mark exactly where the description is incomplete.** They're not errors; they're operational signals.
3. **Duality is the instrument** through which non-dual alignment becomes visible — the gap between what we wanted and what we got is the data.
4. **The method applies to itself**, which prevents premature closure on its own formulation.

Practically: instead of declaring "the resonance model works," we maintain a registry of what we *don't* know, what we've *assumed*, and what structural patterns we've *imported from other domains*. When the model fails or a new feature lands, those registries get amended — not erased.

---

## Registries

- **[assumptions.md](assumptions.md)** — active assumptions with falsification conditions.
- **[active_ignorance_nodes.md](active_ignorance_nodes.md)** — explicit boundaries of understanding (AINs).
- **[isomorphic_mappings.md](isomorphic_mappings.md)** — cross-domain mappings with tier classification.

Created when they have content (not ceremony):

- `failures.md` — when a falsification condition fires.
- `alignment_log.md` — at first quarterly review with real session data.

---

## Four-tier mapping classification

| Tier | Meaning | What transfers |
|---|---|---|
| **SURFACE ANALOGY** | Shared terminology only | Nothing causally. Useful for naming, not for prediction. |
| **HOMOLOGY** | A specific mathematical structure is preserved | Exactly the named invariant. Everything else needs independent verification. |
| **FUNCTORIAL** | Structure-preserving map that preserves compositions | Entire reasoning chains transfer, not just individual properties. |
| **ISOMORPHISM** | Bijective structure-preserving correspondence | Complete transfer in both directions. |

A new mapping cannot be added without naming the **invariant** it preserves. Without that, it's a SURFACE ANALOGY and shouldn't be load-bearing.

---

## Alignment metric (four dimensions, qualitative)

After each significant change, review:

1. **Coverage** — does the model cover the phenomena it claims to cover?
2. **Specificity** — are the predictions sharp enough to be wrong?
3. **Convergence** — is the description getting *richer* over time, or just *bigger*?
4. **Residual** — what remains unaccounted for?

A red flag is description becoming *simpler* without warrant — that's false closure.

---

## How to use these in a PR

Every non-trivial PR should:

1. Touch at least one registry (add an AIN, update an assumption, register a mapping, or note a failure).
2. State which AIN(s) it resolves, partially resolves, or surfaces.
3. If behavior changed, update [ARCHITECTURE.md](../ARCHITECTURE.md) and any design doc **Status** line.
4. If introducing a cross-domain claim, add it to `isomorphic_mappings.md` with a tier.

---

## Parent documents

These documents are external to this repository and inform the methodology discipline:

- **Methodology v1.2** — Isomorphic Enrichment, Alignment Tracking, and Active Ignorance Registry framework. Key concepts: AIN registration, four-tier mapping classification, deferred closure, the "description becomes richer, not just bigger" anti-false-closure test.
- **Presence Engine v2.2** — Relational morphism graph architecture. Key concepts: L1 asynchronous homology detection, L2 typed morphism graph with deferred epistemic closure, L3 articulation surface (recognition + revealed opening), §7.2 neti-neti elimination test. Instantiated in this project at `tools/graph_engine/`.

---

## Offline stack (same methodology)

| Tool | Registry touchpoint |
|------|---------------------|
| [tools/graph_engine/](../../tools/graph_engine/) | IM-006, AIN-RS-014 |
| [tools/synthetic_sessions/](../../tools/synthetic_sessions/) | A-009, controlled labels |
| [tools/journal_noticer/](../../tools/journal_noticer/) | AIN-RS-003, founding principle in [JOURNAL_NOTICER_DESIGN.md](../JOURNAL_NOTICER_DESIGN.md) |
