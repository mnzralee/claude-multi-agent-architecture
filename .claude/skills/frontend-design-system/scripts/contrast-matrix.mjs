#!/usr/bin/env node
// Contrast matrix for design tokens: WCAG 2.x ratio (the gate) plus APCA Lc (advisory).
//
// Usage:
//   node contrast-matrix.mjs tokens.contrast.json [--json]
//
// Input shape (see the example at the bottom of this file, or run with --example):
// {
//   "themes": {
//     "light": { "text.primary": "#1A1714", "surface.canvas": "#F4EEE1", "border": "rgba(0,0,0,.12)" },
//     "dark":  { "text.primary": "oklch(0.95 0.02 85)", "surface.canvas": "#0B0A09", "border": "rgba(255,255,255,.14)" }
//   },
//   "base": { "light": "#FFFFFF", "dark": "#000000" },   // optional: what translucent backgrounds sit on
//   "pairs": [
//     ["text.primary", "surface.canvas", "text"],      // floor 4.5
//     ["heading.display", "surface.canvas", "large"],  // floor 3.0 (24px+, or 18.66px+ bold)
//     ["input.border", "surface.canvas", "ui"],        // floor 3.0 (control boundaries, focus rings, meaningful icons)
//     ["divider", "surface.canvas", "decor"]           // no floor, reported only (WCAG 1.4.11 exempts pure decoration)
//   ]
// }
//
// Colors: #rgb #rgba #rrggbb #rrggbbaa, rgb()/rgba(), oklch(L C H [/ A]) with L as 0..1 or a percentage.
// Translucent foregrounds are composited over the (composited) background, the way the browser paints them.
// Exit code 1 when any pair fails its floor in any theme, so it can run in CI.

import { readFileSync } from "node:fs";

const FLOORS = { text: 4.5, large: 3.0, ui: 3.0, decor: 0 };

// ---------- color parsing ----------

function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  if (s.startsWith("#")) return parseHex(s);
  if (s.startsWith("rgb")) return parseRgb(s);
  if (s.startsWith("oklch")) return parseOklch(s);
  throw new Error(`Unsupported color "${input}". Use hex, rgb() or oklch().`);
}

function parseHex(s) {
  let h = s.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  if (h.length !== 6 && h.length !== 8) throw new Error(`Bad hex "${s}"`);
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1, gamutClipped: false };
}

function splitArgs(s) {
  const inner = s.slice(s.indexOf("(") + 1, s.lastIndexOf(")"));
  const [main, alphaPart] = inner.split("/");
  const parts = main.split(/[\s,]+/).filter(Boolean);
  if (alphaPart !== undefined) parts.push(alphaPart.trim());
  return parts;
}

function num(v, scaleIfPercent = 1) {
  return v.endsWith("%") ? (parseFloat(v) / 100) * scaleIfPercent : parseFloat(v);
}

function parseRgb(s) {
  const p = splitArgs(s);
  const ch = (v) => (v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v) / 255);
  return { r: ch(p[0]), g: ch(p[1]), b: ch(p[2]), a: p[3] !== undefined ? num(p[3]) : 1, gamutClipped: false };
}

function parseOklch(s) {
  const p = splitArgs(s);
  const L = p[0].endsWith("%") ? parseFloat(p[0]) / 100 : parseFloat(p[0]);
  const C = p[1].endsWith("%") ? (parseFloat(p[1]) / 100) * 0.4 : parseFloat(p[1]);
  const H = (parseFloat(p[2]) * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const k = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * k,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * k,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * k,
  ];
  const gamutClipped = lin.some((v) => v < -0.0005 || v > 1.0005);
  const [r, g, bl] = lin.map((v) => encode(Math.min(1, Math.max(0, v))));
  return { r, g, b: bl, a: p[3] !== undefined ? num(p[3]) : 1, gamutClipped };
}

// ---------- color math ----------

const decode = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const encode = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

// Browsers composite in gamma-encoded sRGB, so blend there.
function over(top, bottom) {
  const a = top.a + bottom.a * (1 - top.a);
  const mix = (t, b) => (t * top.a + b * bottom.a * (1 - top.a)) / (a || 1);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a, gamutClipped: top.gamutClipped || bottom.gamutClipped };
}

function wcagLuminance({ r, g, b }) {
  return 0.2126 * decode(r) + 0.7152 * decode(g) + 0.0722 * decode(b);
}

function wcagRatio(fg, bg) {
  const [hi, lo] = [wcagLuminance(fg), wcagLuminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// APCA-W3 0.0.98G-4g. Advisory only: WCAG 2.x is the legal floor.
function apcaLc(fg, bg) {
  const y = ({ r, g, b }) => 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  const clamp = (v) => (v > 0.022 ? v : v + (0.022 - v) ** 1.414);
  const yt = clamp(y(fg));
  const yb = clamp(y(bg));
  if (Math.abs(yb - yt) < 0.0005) return 0;
  if (yb > yt) {
    const sapc = (yb ** 0.56 - yt ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }
  const sapc = (yb ** 0.65 - yt ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
}

const toHex = ({ r, g, b }) =>
  "#" + [r, g, b].map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();

// ---------- main ----------

const EXAMPLE = {
  themes: {
    light: { "text.primary": "#1A1714", "text.secondary": "#5C5147", "surface.canvas": "#F4EEE1", action: "#470A60", "action.fg": "#FFFFFF", border: "#E0D7C8" },
    dark: { "text.primary": "#F4EEE1", "text.secondary": "rgba(244,238,225,.72)", "surface.canvas": "#0B0A09", action: "oklch(0.52 0.18 313)", "action.fg": "#FFFFFF", border: "rgba(232,222,206,.14)" },
  },
  pairs: [
    ["text.primary", "surface.canvas", "text"],
    ["text.secondary", "surface.canvas", "text"],
    ["action.fg", "action", "text"],
    ["border", "surface.canvas", "decor"],
  ],
};

function run(spec, asJson) {
  const rows = [];
  for (const [theme, tokens] of Object.entries(spec.themes)) {
    const base = parseColor(spec.base?.[theme] ?? (theme.includes("dark") ? "#000000" : "#FFFFFF"));
    for (const [fgName, bgName, kind = "text"] of spec.pairs) {
      if (!(fgName in tokens) || !(bgName in tokens)) {
        rows.push({ theme, fg: fgName, bg: bgName, kind, status: "MISSING", note: "token not defined in this theme" });
        continue;
      }
      const bg = over(parseColor(tokens[bgName]), base);
      const fg = over(parseColor(tokens[fgName]), bg);
      const ratio = wcagRatio(fg, bg);
      const floor = FLOORS[kind] ?? FLOORS.text;
      rows.push({
        theme, fg: fgName, bg: bgName, kind, floor,
        ratio: +ratio.toFixed(2), apcaLc: +apcaLc(fg, bg).toFixed(1),
        fgPainted: toHex(fg), bgPainted: toHex(bg),
        status: kind === "decor" ? "INFO" : ratio >= floor ? "PASS" : "FAIL",
        note: fg.gamutClipped || bg.gamutClipped ? "oklch value outside sRGB, clipped" : "",
      });
    }
  }

  // Parity: a pair that passes in one theme and fails in another has not passed.
  const byPair = new Map();
  for (const r of rows) {
    const key = `${r.fg} on ${r.bg}`;
    if (r.kind !== "decor") byPair.set(key, [...(byPair.get(key) ?? []), r.status]);
  }
  const parity = [...byPair].filter(([, s]) => s.includes("PASS") && s.some((x) => x !== "PASS")).map(([k]) => k);

  const failed = rows.filter((r) => r.status === "FAIL" || r.status === "MISSING");
  if (asJson) {
    console.log(JSON.stringify({ rows, parityBreaks: parity, failed: failed.length }, null, 2));
  } else {
    const pad = (v, n) => String(v).padEnd(n);
    console.log(pad("THEME", 8) + pad("FOREGROUND", 22) + pad("BACKGROUND", 20) + pad("KIND", 7) + pad("RATIO", 8) + pad("FLOOR", 7) + pad("APCA Lc", 9) + "RESULT");
    for (const r of rows) {
      console.log(pad(r.theme, 8) + pad(r.fg, 22) + pad(r.bg, 20) + pad(r.kind, 7) + pad(r.ratio ?? "-", 8) + pad(r.floor ?? "-", 7) + pad(r.apcaLc ?? "-", 9) + r.status + (r.note ? `  (${r.note})` : ""));
    }
    console.log(`\n${rows.length - failed.length} of ${rows.length} pass.`);
    if (parity.length) console.log(`Theme parity breaks (pass in one theme, fail in another): ${parity.join("; ")}`);
    console.log("APCA Lc is advisory (aim: 90 for key numerals, 75 body, 60 other text, 45 large or UI). WCAG ratio is the gate.");
  }
  return failed.length === 0;
}

const args = process.argv.slice(2);
if (args.includes("--example")) {
  console.log(JSON.stringify(EXAMPLE, null, 2));
  process.exit(0);
}
const file = args.find((a) => !a.startsWith("--"));
const spec = file ? JSON.parse(readFileSync(file, "utf8")) : EXAMPLE;
if (!file) console.log("No input file given, running the built-in example.\n");
process.exit(run(spec, args.includes("--json")) ? 0 : 1);
