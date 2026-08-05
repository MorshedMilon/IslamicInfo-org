/* RENDER ASSERTION — does a reader actually see a page?
 *
 *   node scripts/test/render-assertion.mjs                # production
 *   node scripts/test/render-assertion.mjs --base=http://localhost:3000
 *
 * WHY THIS EXISTS. On 2026-08-04 /dua.html was found serving
 * "The dua library is being rebuilt and will return here soon." to every visitor,
 * and had been since 2026-07-31. Nothing caught it. Every check in the dua
 * programme asserted DATA correctness; none asked whether a reader sees a page.
 *
 * It also survived a check that named it explicitly. A body.includes() over the
 * SERVED HTML reported "0 links" — true, and meaningless, because /dua.html renders
 * client-side and its served HTML has no cards at all. The check passed by finding
 * nothing rather than by confirming absence.
 *
 * So: this drives a real browser and reads the DOM AFTER hydration, and every route
 * declares the container that must be populated. A route whose container is empty,
 * or which shows a maintenance/empty-state string, FAILS.
 *
 * POSITIVE CONTROL. --expect-fail=/dua.html asserts a named route DOES fail. Written
 * against the live incident before it was fixed, so the check is demonstrated to
 * detect this exact class rather than assumed to. A check written after the fix has
 * never been shown to detect anything.
 */
import { chromium } from "playwright-core";

const arg = (k, d) => (process.argv.find((a) => a.startsWith("--" + k + "=")) || "=" + d).split("=").slice(1).join("=");
const BASE = arg("base", "https://islamicinfo.org");
const EXPECT_FAIL = new Set(arg("expect-fail", "").split(",").filter(Boolean));

/* Each route names the container that must hold rendered content. `min` is the
   floor for real children — deliberately low: this is a smoke test for "the page
   rendered at all", not a content audit. */
const ROUTES = [
  { path: "/dua.html",             container: ".dua-grid",  min: 1 },
  { path: "/quran.html",           container: ".page-shell", min: 3 },
  { path: "/hadith.html",          container: "main",       min: 5 },
  { path: "/tools.html",           container: ".shell",     min: 3 },
  { path: "/habits.html",          container: "main",       min: 3 },
  { path: "/verify.html",          container: "main",       min: 3 },
  { path: "/index.html",           container: "main",       min: 3 },
  { path: "/islamic-studies.html", container: "main",       min: 3 },
  { path: "/knowledge-hub.html",   container: ".shell",     min: 3 },
];

/* Copy that means "a reader is looking at a placeholder INSTEAD OF the page".
   Matched inside the container only, so unrelated page chrome cannot trip it.

   "coming soon" is deliberately NOT here. It is a legitimate feature-card badge on
   /quran.html and /tools.html — this platform labels unbuilt features honestly, and
   a page carrying such a card has still rendered. Including it produced two false
   positives on the first run, which is the difference between a check that means
   something and one that shouts. */
const MAINTENANCE = /being rebuilt|temporarily unavailable|failed to load|please refresh/i;
const EMPTY_CLASS = /(^|\s)(dua-empty|empty-state|is-empty)(\s|$)/;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

for (const r of ROUTES) {
  const page = await browser.newPage();
  let status = 0;
  page.on("response", (res) => { if (res.url() === BASE + r.path) status = res.status(); });
  let navErr = null;
  try { await page.goto(BASE + r.path, { waitUntil: "networkidle", timeout: 45000 }); }
  catch (e) { navErr = String(e).split("\n")[0]; }
  await page.waitForTimeout(2000);

  const o = await page.evaluate(({ container, emptyRe, maintRe }) => {
    const el = document.querySelector(container);
    if (!el) return { missing: true };
    const kids = [...el.children];
    const real = kids.filter((k) => !new RegExp(emptyRe).test(" " + k.className + " "));
    return {
      missing: false,
      children: kids.length,
      real: real.length,
      maintenance: (el.innerText || "").match(new RegExp(maintRe, "i"))?.[0] || null,
    };
  }, { container: r.container, emptyRe: EMPTY_CLASS.source, maintRe: MAINTENANCE.source })
    .catch(() => ({ missing: true }));

  const reasons = [];
  if (navErr) reasons.push("navigation: " + navErr);
  if (status && status !== 200) reasons.push("HTTP " + status);
  if (o.missing) reasons.push("container " + r.container + " not found");
  else {
    if (o.real < r.min) reasons.push(`container has ${o.real} real children, needs >= ${r.min}`);
    if (o.maintenance) reasons.push(`maintenance copy: "${o.maintenance}"`);
  }
  results.push({ path: r.path, ok: reasons.length === 0, reasons, o, status });
  await page.close();
}
await browser.close();

console.log("RENDER ASSERTION — " + BASE + "\n");
console.log("route".padEnd(24) + "http  children  verdict");
for (const r of results) {
  console.log(r.path.padEnd(24) + String(r.status || "-").padEnd(6) +
    String(r.o.missing ? "-" : r.o.real).padEnd(9) + (r.ok ? "renders" : "FAIL — " + r.reasons.join("; ")));
}

/* ---- positive control ---------------------------------------------------- */
let exit = 0;
const failed = results.filter((r) => !r.ok).map((r) => r.path);
if (EXPECT_FAIL.size) {
  console.log("\nPOSITIVE CONTROL — these routes are asserted to FAIL:");
  for (const p of EXPECT_FAIL) {
    const hit = failed.includes(p);
    console.log("  " + p.padEnd(22) + (hit ? "failed as expected — the check detects this class" : "DID NOT FAIL — control is worthless, the check proves nothing"));
    if (!hit) exit = 2;
  }
  const unexpected = failed.filter((p) => !EXPECT_FAIL.has(p));
  if (unexpected.length) { console.log("\n  unexpected failures: " + unexpected.join(", ")); exit = exit || 1; }
} else {
  exit = failed.length ? 1 : 0;
}
console.log(exit === 0 ? "\nRESULT: PASS" : "\nRESULT: FAIL (" + (exit === 2 ? "control" : failed.length) + ")");
process.exit(exit);
