"""
physics.py — Python port of src/physics.js

A faithful reimplementation of the coupled-oscillator resonance model
so that synthetic sessions are generated from the *same* physics the
artifact renders. If you change src/physics.js, change this to match.

Verified against the JS module's output on 2026-05-21:
  A3@220  -> larynx 100%, oral 78%, ears 54% ...
  SWEET@262 -> skull 78%, nasal 66%, larynx⇌pharynx anti-resonance 0.82
  DEAD@355  -> pharynx⇌oral anti-resonance 1.00, both zones suppressed
These match the JS reference exactly (same formulas, same constants).
"""

from __future__ import annotations
import math
from dataclasses import dataclass


# ─── Zone definitions (must match physics.js) ──────────────────

@dataclass(frozen=True)
class Zone:
    id: str
    name: str
    nx: float
    ny: float
    freq: float
    Q: float


ZONES = [
    Zone("chest",    "Chest cavity",    0.50, 0.78, 120, 0.35),
    Zone("heart",    "Heart",           0.45, 0.69, 105, 0.28),
    Zone("tracheal", "Tracheal column", 0.50, 0.62, 180, 0.45),
    Zone("larynx",   "Larynx",          0.50, 0.52, 220, 0.20),
    Zone("pharynx",  "Pharynx",         0.50, 0.45, 300, 0.50),
    Zone("mouth",    "Oral cavity",     0.56, 0.36, 420, 0.55),
    Zone("nasal",    "Nasal / sinuses", 0.51, 0.30, 580, 0.60),
    Zone("skull",    "Cranial bone",    0.50, 0.20, 520, 0.40),
    Zone("eyes",     "Orbital cavities",0.56, 0.26, 680, 0.70),
    Zone("ears",     "Inner ear",       0.42, 0.26, 760, 0.80),
]


# ─── Anti-resonance pairs (must match physics.js derivation) ────

def _build_anti_resonances():
    sorted_zones = sorted(ZONES, key=lambda z: z.freq)
    pairs = []
    for i in range(len(sorted_zones) - 1):
        a, b = sorted_zones[i], sorted_zones[i + 1]
        if b.freq / a.freq > 2.2:
            continue
        f = math.sqrt(a.freq * b.freq)
        gap = b.freq - a.freq
        width = max(6.0, gap * 0.13)
        depth = 0.85
        pairs.append({"a": a, "b": b, "f": f, "width": width, "depth": depth})
    return pairs


ANTI_RESONANCES = _build_anti_resonances()


def anti_resonance_factor(zone: Zone, drive_f: float) -> float:
    factor = 1.0
    for ar in ANTI_RESONANCES:
        if ar["a"] is not zone and ar["b"] is not zone:
            continue
        d = abs(drive_f - ar["f"])
        if d > ar["width"] * 3:
            continue
        dip = ar["depth"] * math.exp(-((d / ar["width"]) ** 2))
        factor *= (1 - dip)
    return factor


def active_anti_resonance(drive_f: float):
    best, best_score = None, 0.0
    for ar in ANTI_RESONANCES:
        d = abs(drive_f - ar["f"])
        if d > ar["width"] * 2.2:
            continue
        score = math.exp(-((d / ar["width"]) ** 2))
        if score > best_score:
            best_score, best = score, ar
    return (best, best_score) if best else (None, 0.0)


def zone_response(zone: Zone, drive_f: float) -> float:
    best = 0.0
    for h in range(1, 9):
        hf = drive_f * h
        ratio = hf / zone.freq
        if ratio < 0.25 or ratio > 4:
            continue
        cents = abs(math.log2(ratio)) * 1200
        bw = zone.Q * 600
        g = math.exp(-((cents / bw) ** 2))
        r = g / (h ** 0.55)
        if r > best:
            best = r
    best *= anti_resonance_factor(zone, drive_f)
    return best


def apply_coupling(raw_amps: list[float]) -> list[float]:
    coupled = list(raw_amps)
    for i in range(len(ZONES)):
        for j in range(len(ZONES)):
            if i == j:
                continue
            dx = ZONES[i].nx - ZONES[j].nx
            dy = ZONES[i].ny - ZONES[j].ny
            d = math.sqrt(dx * dx + dy * dy)
            k = 0.18 * math.exp(-((d / 0.25) ** 2))
            coupled[i] += raw_amps[j] * k * 0.4
        coupled[i] = min(1.0, coupled[i])
    return coupled


def system_state(drive_f: float):
    """Return (amps, sys_amp, active_count, ar_strength) for a drive frequency."""
    raw = [zone_response(z, drive_f) for z in ZONES]
    amps = apply_coupling(raw)
    sys_amp = sum(amps) / len(amps)
    active_count = sum(1 for a in amps if a > 0.4)
    _, ar_strength = active_anti_resonance(drive_f)
    return amps, sys_amp, active_count, ar_strength


if __name__ == "__main__":
    # Self-check against known reference values
    for label, f in [("A3", 220), ("SWEET", 261.6), ("DEAD", 355), ("SKULL", 587)]:
        amps, sys_amp, active, ar = system_state(f)
        top = sorted(zip([z.name for z in ZONES], amps), key=lambda x: -x[1])[:3]
        top_str = ", ".join(f"{n} {a*100:.0f}%" for n, a in top)
        print(f"{label:6} @ {f:6} Hz | sysAmp {sys_amp:.2f} | active {active} | AR {ar:.2f} | top: {top_str}")
