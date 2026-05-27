/**
 * articulation.js — Passive badge enrichment from articulation.json (§6.4)
 *
 * Past-tense recognitions only. Never recommendations. Loaded optionally from
 * tools/graph_engine/articulate.py output at repo root or alongside index.html.
 */

let cache = null;
let loadAttempted = false;

export async function loadArticulation(url = 'articulation.json') {
  if (loadAttempted) return cache;
  loadAttempted = true;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    cache = await res.json();
    return cache;
  } catch {
    return null;
  }
}

/** First matching opening for badge tooltip, or null. */
export function articulationHint(doc, sysAmp, activeCount) {
  if (!doc?.items?.length) return null;
  const item = doc.items[0];
  const parts = [];
  if (item.recognition) parts.push(item.recognition);
  if (item.opening) parts.push(`Open: ${item.opening}`);
  if (item.warrant) parts.push(`(${item.warrant})`);
  return parts.join(' · ') || null;
}
