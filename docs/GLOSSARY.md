# Glossary

Resolves AIN-RS-010: the word **resonance** is used in three senses. The badge and physics use only one of them.

**Parent:** [README.md](../README.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Three senses of “resonance”

| Sense | Meaning | Used where |
|-------|---------|------------|
| **Acoustic** | Sharp response when drive frequency (or a harmonic) lands near a cavity’s natural mode | `zoneResponse`, Q, harmonic stack |
| **Phenomenological** | Felt sense of a note “placing” or “ringing through” the body | Essay, presets, user-facing copy |
| **Metaphorical** | “This song resonates with me” (compatibility, meaning) | **Not computed** — explicitly out of scope |

The artifact models **acoustic stylization** informed by phenomenology. It does **not** measure personal compatibility with a song.

---

## Anti-resonance (two kinds)

| Term | Also called | Mechanism | UI |
|------|-------------|-----------|-----|
| **Spectral null** | Frequency-domain notch | Gaussian suppression at √(f₁·f₂) between adjacent zone pairs | Left-rail ◊ presets (NULL, DEAD, COLD, MUTE) |
| **Spatial node** | Interference cancellation | Two coherent sources cancel at a point in the field grid | Emerges when song + internal drive both active (`field.js`) |

Do not conflate them. The field does not replace the four spectral nulls.

---

## Drivers

A **driver** is `{ f, amp, phase, origin }`.

| `origin` | Source |
|----------|--------|
| `internal` | Slider or mic-derived pitch |
| `preset` | Pinned frequency (MULTI mode) |
| `external` | Song FFT peaks |
| `env` | Environmental preset (MAINS, HVAC, …) |

---

## Badge states (acoustic thresholds)

The badge uses **acoustic** thresholds on coupled zone amplitudes, not felt-sense reports:

| Label | Approximate condition |
|-------|------------------------|
| Off-resonance | Low sysAmp |
| Subtle tuning | sysAmp > 0.15 |
| Harmonic coupling | sysAmp > 0.35 or activeCount ≥ 3 |
| Whole-system resonance | sysAmp > 0.55 and activeCount ≥ 5 |
| ◊ Anti-resonance | Strong spectral null active |

Optional tooltip text may add **past-tense** context from `articulation.json` (offline graph); that is not a prediction about the current user.
