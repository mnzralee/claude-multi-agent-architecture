#!/usr/bin/env node
// DRY guard: finds components that are probably copies of each other.
// Groups component files by a normalized name (StepIndicator, step-indicator, NewStepIndicator,
// StepIndicatorV2 and LegacyStepIndicator all collapse to "stepindicator") and reports any group
// with more than one member. Two similar blocks are a coincidence; a reported group is a question:
// "should these be one primitive with variants?"
//
// Usage: node find-duplicate-components.mjs [dir ...] [--json]

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname, basename, dirname } from "node:path";

const EXTS = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro"]);
const SKIP = new Set(["node_modules", ".next", "dist", "build", "out", ".git", "coverage", "storybook-static"]);
const NOISE = /^(?:new|old|legacy|custom|base|app|my|the|simple|basic|generic|shared|common|ui)|(?:v\d+|new|old|legacy|custom|copy|alt|2|component|wrapper|container|view)$/;

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (EXTS.has(extname(name)) && !/\.(test|spec|stories)\./.test(name)) files.push(p);
  }
  return files;
}

// Framework entry files (Next.js app router, SvelteKit, Nuxt) are routes, not components.
const FRAMEWORK = /^(?:page|layout|loading|error|template|default|not-found|global-error|route|\+page|\+layout|\+error|app|_app|_document)$/;

function normalize(file) {
  let name = basename(file, extname(file));
  if (FRAMEWORK.test(name)) return "";
  if (name === "index") name = basename(dirname(file));
  let n = name.replace(/[-_.\s]/g, "").toLowerCase();
  for (let i = 0; i < 3; i++) n = n.replace(NOISE, "");
  return n;
}

const args = process.argv.slice(2);
const dirs = args.filter((a) => !a.startsWith("--"));
const files = (dirs.length ? dirs : ["src"]).flatMap((d) => walk(d));
const groups = new Map();
for (const f of files) {
  const key = normalize(f);
  if (key.length < 3 || ["page", "layout", "loading", "error", "template", "default"].includes(key)) continue;
  groups.set(key, [...(groups.get(key) ?? []), relative(process.cwd(), f)]);
}
const dupes = [...groups].filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length);

if (args.includes("--json")) {
  console.log(JSON.stringify({ scanned: files.length, groups: Object.fromEntries(dupes) }, null, 2));
} else {
  for (const [key, members] of dupes) {
    console.log(`${key} (${members.length})`);
    for (const m of members) console.log(`  ${m}`);
  }
  console.log(`\nScanned ${files.length} component files. ${dupes.length} name groups with more than one member.`);
  if (dupes.length) console.log("Review each group: merge into one primitive with variants, or rename if they truly do different jobs.");
}
