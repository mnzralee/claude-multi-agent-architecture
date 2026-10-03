#!/usr/bin/env node
// Token-discipline guard: finds raw design values that bypass the design system.
// Ships as a shrink-only ratchet so a legacy codebase can adopt it without a big-bang fix.
//
// Usage:
//   node check-raw-values.mjs [dir ...] [--allow tokens.css,theme.ts] [--ban-import lucide-react=src/lib/icons.ts]
//                             [--baseline .design-baseline.json] [--update] [--json]
//
//   dir            folders to scan (default: src)
//   --allow        comma list of path fragments where raw values are legal (the token source files)
//   --ban-import   pkg=barrelPath: importing pkg anywhere except the barrel is a violation (repeatable)
//   --baseline     ratchet file. Without --update: fail only when a file has MORE violations than recorded.
//   --update       write the current counts as the new baseline (do this only when counts went down)
//
// Exit code 1 on new violations, so it can gate CI or a pre-push hook.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".vue", ".svelte", ".astro", ".css", ".scss", ".html"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", "out", ".git", "coverage", ".turbo", ".svelte-kit", "storybook-static"]);
const PALETTE = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const UTIL = "bg|text|border|ring|fill|stroke|from|via|to|outline|divide|placeholder|shadow|accent|caret|decoration";

// Each rule says WHY it exists, because a guard nobody understands gets disabled.
const RULES = [
  {
    id: "hex-color",
    why: "A literal hex is a color nobody can retheme. Use a semantic token so light, dark and brand changes are one edit.",
    re: /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g,
  },
  {
    id: "color-function",
    why: "rgb(), hsl() and oklch() literals are raw colors. They belong only in the token source.",
    re: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*[\d.]/g,
  },
  {
    id: "tw-arbitrary",
    why: "Tailwind arbitrary values (text-[13px], gap-[7px], bg-[#fff]) are decisions nobody made. If no scale step fits, the design is wrong, not the scale.",
    re: /\b[a-z][a-z0-9:-]*-\[(?!var\()[^\]\s]+\]/g,
  },
  {
    id: "tw-raw-palette",
    why: "Raw palette classes (bg-blue-500, text-white) skip the semantic layer. Use role classes (bg-surface, text-muted, bg-action).",
    re: new RegExp(`\\b(?:[a-z]+:)*(?:${UTIL})-(?:(?:${PALETTE})-\\d{2,3}|white|black)(?:\\/\\d+)?\\b`, "g"),
  },
  {
    id: "px-font-size",
    why: "Font sizes in px ignore the reader's browser text-size setting. Use the rem type scale.",
    re: /font-size\s*:\s*\d+(?:\.\d+)?px/g,
  },
  {
    id: "inline-style-literal",
    why: "Inline style objects with literal sizes or colors bypass tokens. Inline style is for runtime values only.",
    re: /style=\{\{[^}]*?(?:\d+px|#[0-9a-fA-F]{3,8}\b)/g,
  },
];

function parseArgs(argv) {
  const out = { dirs: [], allow: [], bans: [], baseline: null, update: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--allow") out.allow.push(...argv[++i].split(",").map((s) => s.trim()).filter(Boolean));
    else if (a === "--ban-import") {
      const [pkg, barrel] = argv[++i].split("=");
      out.bans.push({ pkg, barrel: barrel ?? "" });
    } else if (a === "--baseline") out.baseline = argv[++i];
    else if (a === "--update") out.update = true;
    else if (a === "--json") out.json = true;
    else out.dirs.push(a);
  }
  if (!out.dirs.length) out.dirs.push("src");
  return out;
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (EXTS.has(extname(name)) && !/\.(test|spec|stories)\.[jt]sx?$/.test(name)) files.push(p);
  }
  return files;
}

// Strip comments so documentation and commented-out code do not count. Keeps line numbers.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

function scanFile(path, opts) {
  const rel = relative(process.cwd(), path);
  const allowed = opts.allow.some((frag) => rel.includes(frag));
  const text = stripComments(readFileSync(path, "utf8"));
  const lineOf = (idx) => text.slice(0, idx).split("\n").length;
  const hits = [];
  if (!allowed) {
    for (const rule of RULES) {
      for (const m of text.matchAll(rule.re)) hits.push({ rule: rule.id, line: lineOf(m.index), match: m[0].slice(0, 60) });
    }
  }
  for (const { pkg, barrel } of opts.bans) {
    if (barrel && rel.includes(barrel)) continue;
    const re = new RegExp(`from\\s+["']${pkg.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?:/[^"']*)?["']`, "g");
    for (const m of text.matchAll(re)) hits.push({ rule: `banned-import:${pkg}`, line: lineOf(m.index), match: m[0] });
  }
  return { rel, hits };
}

const opts = parseArgs(process.argv.slice(2));
const files = opts.dirs.flatMap((d) => walk(d));
const results = files.map((f) => scanFile(f, opts)).filter((r) => r.hits.length);
const counts = Object.fromEntries(results.map((r) => [r.rel, r.hits.length]));
const total = results.reduce((n, r) => n + r.hits.length, 0);

if (opts.update) {
  if (!opts.baseline) throw new Error("--update needs --baseline <file>");
  writeFileSync(opts.baseline, JSON.stringify({ generated: new Date().toISOString(), total, files: counts }, null, 2) + "\n");
  console.log(`Baseline written: ${total} violations in ${results.length} files (${opts.baseline}).`);
  process.exit(0);
}

let failing = results;
if (opts.baseline && existsSync(opts.baseline)) {
  const base = JSON.parse(readFileSync(opts.baseline, "utf8")).files ?? {};
  failing = results.filter((r) => r.hits.length > (base[r.rel] ?? 0));
  const shrunk = Object.keys(base).filter((f) => (counts[f] ?? 0) < base[f]);
  if (shrunk.length && !opts.json) console.log(`Improved since baseline: ${shrunk.length} files. Run with --update to lock the gain in.\n`);
}

if (opts.json) {
  console.log(JSON.stringify({ scanned: files.length, total, failing: failing.map((r) => r.rel), results }, null, 2));
} else {
  for (const r of failing) {
    console.log(r.rel);
    for (const h of r.hits) console.log(`  ${String(h.line).padStart(5)}  ${h.rule.padEnd(22)} ${h.match}`);
  }
  const byRule = {};
  for (const r of results) for (const h of r.hits) byRule[h.rule] = (byRule[h.rule] ?? 0) + 1;
  console.log(`\nScanned ${files.length} files. ${total} raw values in ${results.length} files.`);
  for (const [rule, n] of Object.entries(byRule)) {
    const why = RULES.find((x) => x.id === rule)?.why ?? "Import through the project barrel so there is one source for this dependency.";
    console.log(`  ${rule}: ${n}. ${why}`);
  }
  if (opts.baseline) console.log(failing.length ? `\nFAIL: ${failing.length} files grew past the baseline.` : "\nPASS: nothing grew past the baseline.");
}
process.exit(failing.length && (opts.baseline || total) ? 1 : 0);
