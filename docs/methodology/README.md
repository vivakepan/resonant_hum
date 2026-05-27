# Methodology Registries

These files implement the **Isomorphic Enrichment, Alignment Tracking, and Active Ignorance Registry** discipline from the parent methodology document (Methodology v1.2) for the Resonant Singer project. They are *living* artifacts: any non-trivial change to the system should add to or amend them.

## Why these files exist

The parent methodology rests on four assumptions:

1. **Truth is alignment between problem and solution.** When something fails, the *problem description* is incomplete — not the solution.
2. **Illogical relationships mark exactly where the description is incomplete.** They're not errors; they're operational signals.
3. **Duality is the instrument** through which non-dual alignment becomes visible — the gap between what we wanted and what we got is the data.
4. **The method applies to itself**, which prevents premature closure on its own formulation.

Practically: instead of declaring "the resonance model works," we maintain a registry of what we *don't* know, what we've *assumed*, and what structural patterns we've *imported from other domains*. When the model fails or a new feature lands, those registries get amended — not erased.

## The three day-one registries

- **[assumptions.md](assumptions.md)** — all active assumptions with falsification conditions. Each assumption has a status (ACTIVE / REFINED / FALSIFIED / UNTESTED) and a blast radius.
- **[active_ignorance_nodes.md](active_ignorance_nodes.md)** — explicit boundaries of understanding. An AIN is a registered illogical relationship or unresolved gap. Each AIN names where in the code it lives and what would resolve it.
- **[isomorphic_mappings.md](isomorphic_mappings.md)** — cross-domain structural mappings imported into the project, each classified by quality.

Two more files (`failures.md`, `alignment_log.md`) will be created when they have content — empty registries are ceremony, not discipline.

## The four-tier mapping classification

When importing structure from another domain (acoustics, room physics, Helmholtz resonators, etc.), classify the mapping:

| Tier | Meaning | What transfers |
|---|---|---|
| **SURFACE ANALOGY** | Shared terminology only | Nothing causally. Useful for naming, not for prediction. |
| **HOMOLOGY** | A specific mathematical structure is preserved | Exactly the named invariant. Everything else needs independent verification. |
| **FUNCTORIAL** | Structure-preserving map that preserves compositions | Entire reasoning chains transfer, not just individual properties. |
| **ISOMORPHISM** | Bijective structure-preserving correspondence | Complete transfer in both directions. |

A new mapping cannot be added without naming the **invariant** it preserves. Without that, it's a SURFACE ANALOGY and shouldn't be load-bearing.

## The alignment metric (four dimensions, qualitative)

After each significant change, review:

1. **Coverage** — does the model cover the phenomena it claims to cover?
2. **Specificity** — are the predictions sharp enough to be wrong?
3. **Convergence** — is the description getting *richer* over time, or just *bigger*?
4. **Residual** — what remains unaccounted for?

A red flag is description becoming *simpler* without warrant — that's the signature of false closure (declaring success against a simplified problem).

## How to use these in a PR

Every non-trivial PR should:

1. Touch at least one registry (add an AIN, update an assumption, register a new mapping, or note a failure).
2. State which AIN(s) it resolves, partially resolves, or surfaces.
3. If it introduces a cross-domain claim ("this is like X in domain Y"), add it to `isomorphic_mappings.md` with a tier classification.

This is a discipline, not a process. The goal is to make our boundary of understanding visible to ourselves and to future contributors.

## Parent documents

- `methodology_v1_2.md` — the operational framework these registries implement.
- `PresenceEngine_v2_2.md` — sibling research program; the morphism graph (§6 of the refinement roadmap) is convergent with its architecture.

Both live outside this repository as part of the broader research program.
