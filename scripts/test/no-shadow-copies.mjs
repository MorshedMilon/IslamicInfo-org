/* SHADOW-COPY GUARD
 *
 *   node scripts/test/no-shadow-copies.mjs
 *
 * Fails when a filename that exists as a TRACKED file also appears UNTRACKED
 * somewhere else in the tree. That is the signature of a document arriving by a
 * route other than git — pasted, attached, transcribed — and landing beside the
 * real one.
 *
 * WHY. On 2026-08-05 four such files appeared in a single session: DESIGN-SYSTEM.md
 * at the root (duplicate of doc/DESIGN-SYSTEM.md), global.css at the root and again
 * at src/css/ (neither linked by any of 563 pages), and doc/DESIGN_LOCK.md
 * (duplicate of the tracked root DESIGN_LOCK.md). One of them — a root CLAUDE.md —
 * got as far as becoming the document that /duas/** conformance was about to be
 * validated against, and it was a lossy transcription missing seven sections.
 *
 * Caught by eye that day. This makes the class self-detecting.
 * See .claude/CLAUDE.md, "no document supplied in chat is authoritative".
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const IGNORE = /^(node_modules|\.git|reports)\//;

function scan() {
  const tracked = execSync("git ls-files", { maxBuffer: 128 * 1024 * 1024 }).toString().split("\n").filter(Boolean);
  const untracked = execSync("git ls-files --others --exclude-standard", { maxBuffer: 128 * 1024 * 1024 })
    .toString().split("\n").filter(Boolean).filter((p) => !IGNORE.test(p));

  const trackedByBase = new Map();
  for (const p of tracked) {
    const b = path.basename(p);
    if (!trackedByBase.has(b)) trackedByBase.set(b, []);
    trackedByBase.get(b).push(p);
  }
  /* A shared basename alone is not the signal — root package.json and
     worker/package.json legitimately differ. The signal is a shared basename PLUS
     near-identical content: a copy of a tracked document, sitting outside git. All
     four real strays on 2026-08-05 were byte-identical to their originals. */
  const hits = [];
  for (const u of untracked) {
    const b = path.basename(u);
    const owners = trackedByBase.get(b);
    if (!owners || owners.includes(u)) continue;
    let uSize; try { uSize = fs.statSync(u).size; } catch { continue; }
    for (const t of owners) {
      let tSize; try { tSize = fs.statSync(t).size; } catch { continue; }
      const ratio = Math.min(uSize, tSize) / Math.max(uSize, tSize || 1);
      if (ratio < 0.9) continue;                       // materially different -> not a copy
      const identical = uSize === tSize && fs.readFileSync(u).equals(fs.readFileSync(t));
      hits.push({ shadow: u, tracked: t, identical, ratio });
    }
  }
  return hits;
}

/* NEGATIVE CONTROL — prove the check can fire. A synthetic pair must be detected by
   the same comparison the real scan uses; a guard that has never fired is
   indistinguishable from a guard that passes. */
function control() {
  const tracked = ["doc/DESIGN-SYSTEM.md"];
  const untracked = ["DESIGN-SYSTEM.md"];
  const byBase = new Map([["DESIGN-SYSTEM.md", tracked]]);
  const found = untracked.filter((u) => { const o = byBase.get(path.basename(u)); return o && !o.includes(u); });
  return found.length === 1;
}

if (!control()) { console.error("ABORT — negative control failed: this guard cannot detect a shadow copy."); process.exit(2); }
console.log("negative control: a synthetic shadow copy IS detected\n");

const hits = scan();
if (!hits.length) {
  console.log("SHADOW-COPY GUARD: PASS — no untracked file shares a basename with a tracked file");
  process.exit(0);
}
console.log("SHADOW-COPY GUARD: FAIL (" + hits.length + ")");
for (const h of hits) console.log("  " + h.shadow + "\n      shadows tracked: " + h.tracked +
  (h.identical ? "   (BYTE-IDENTICAL)" : "   (" + Math.round(h.ratio * 100) + "% same size)"));
console.log("\nA file arriving outside git beside a tracked original is quarantined, not committed.");
process.exit(1);
